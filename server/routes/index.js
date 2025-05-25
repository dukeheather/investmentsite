const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const PaytmChecksum = require('paytmchecksum');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

function getUserIdFromToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      return decoded.id;
    } catch {
      return null;
    }
  }
  return null;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET /api/dashboard
router.get('/api/dashboard', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    // Fetch both running and pending_verification
    const activePlans = await prisma.investment.findMany({
      where: { userId, status: { in: ['running', 'pending_verification'] } },
      orderBy: { createdAt: 'desc' },
    });
    const history = await prisma.investment.findMany({
      where: { userId, status: { notIn: ['running', 'pending_verification'] } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ activePlans, history });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

// GET /api/wallet/balance
router.get('/api/wallet/balance', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  res.json({ balance: user.walletBalance });
});

// GET /api/wallet/transactions
router.get('/api/wallet/transactions', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const txns = await prisma.walletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ transactions: txns });
});

// POST /api/purchase
router.post('/api/purchase', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { planName, amount, notes } = req.body;

  // Plan min/max enforcement
  const planLimits = {
    'Starter Plan': { min: 100, max: 999 },
    'Growth Plan': { min: 1000, max: 9999 },
    'Elite Plan': { min: 10000, max: 100000 },
  };
  const limits = planLimits[planName];
  if (!limits) return res.status(400).json({ error: 'Invalid plan.' });
  const amountNum = Number(amount);
  if (amountNum < limits.min || amountNum > limits.max) {
    return res.status(400).json({ error: `Amount must be between $${limits.min} and $${limits.max}.` });
  }

  try {
    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check wallet balance
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user.walletBalance < amountNum) {
        throw new Error('Insufficient wallet balance.');
      }

      // Deduct from wallet
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: amountNum } },
      });

      // Record wallet deduction
      await tx.walletTransaction.create({
        data: {
          userId,
          amount: -amountNum,
          type: 'deduct',
          status: 'success',
          gatewayTxnId: null,
        },
      });

      // Create investment (status running)
      const investment = await tx.investment.create({
        data: {
          userId,
          planName,
          amount: amountNum,
          status: 'running',
          transactionId: `INV_${Date.now()}`,
          notes,
        },
      });

      return investment;
    });

    res.json({ success: true, investment: result });
  } catch (e) {
    console.error('Purchase error:', e);
    res.status(500).json({ error: e.message || 'Failed to purchase plan.' });
  }
});

// Helper function to check if user is admin
async function isAdmin(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  });
  return user?.isAdmin || false;
}

// GET /api/admin/check
router.get('/api/admin/check', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const admin = await isAdmin(userId);
  res.json({ isAdmin: admin });
});

// GET /api/admin/pending-investments
router.get('/api/admin/pending-investments', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  if (!await isAdmin(userId)) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    const pendingInvestments = await prisma.investment.findMany({
      where: { status: 'pending_verification' },
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ pendingInvestments });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch pending investments' });
  }
});

// POST /api/admin/update-investment-status
router.post('/api/admin/update-investment-status', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  if (!await isAdmin(userId)) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  const { investmentId, status, adminNotes } = req.body;
  if (!['running', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const investment = await prisma.investment.update({
      where: { id: investmentId },
      data: {
        status,
        adminNotes,
        verifiedAt: new Date(),
        verifiedBy: userId
      }
    });
    res.json({ success: true, investment });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update investment status' });
  }
});

// Initiate Paytm payment for wallet top-up
router.post('/api/wallet/topup/initiate', async (req, res) => {
  const { amount } = req.body;
  const userId = getUserIdFromToken(req);
  if (!userId || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  const orderId = 'ORDER_' + Date.now() + '_' + userId;
  const paytmParams = {
    MID: process.env.PAYTM_MID,
    WEBSITE: process.env.PAYTM_WEBSITE,
    INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE,
    CHANNEL_ID: 'WEB',
    ORDER_ID: orderId,
    CUST_ID: String(userId),
    TXN_AMOUNT: String(amount),
    CALLBACK_URL: process.env.PAYTM_CALLBACK_URL,
    EMAIL: '',
    MOBILE_NO: '',
  };
  try {
    const checksum = await PaytmChecksum.generateSignature(paytmParams, process.env.PAYTM_MERCHANT_KEY);
    paytmParams.CHECKSUMHASH = checksum;
    // Save a pending WalletTransaction
    await prisma.walletTransaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type: 'topup',
        status: 'pending',
        gatewayTxnId: orderId,
      },
    });
    res.json({ paytmParams });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Paytm callback endpoint
router.post('/api/wallet/paytm-callback', async (req, res) => {
  const received_data = req.body;
  const paytmChecksum = received_data.CHECKSUMHASH;
  delete received_data.CHECKSUMHASH;
  const isVerifySignature = PaytmChecksum.verifySignature(received_data, process.env.PAYTM_MERCHANT_KEY, paytmChecksum);
  if (!isVerifySignature) {
    return res.status(400).json({ error: 'Checksum mismatch' });
  }
  // Check transaction status with Paytm
  const paytmParams = {
    MID: process.env.PAYTM_MID,
    ORDERID: received_data.ORDERID,
  };
  try {
    const checksum = await PaytmChecksum.generateSignature(paytmParams, process.env.PAYTM_MERCHANT_KEY);
    const post_data = JSON.stringify({ ...paytmParams, CHECKSUMHASH: checksum });
    const { data } = await axios.post(
      'https://securegw.paytm.in/order/status',
      post_data,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (data.STATUS === 'TXN_SUCCESS') {
      // Credit wallet and update transaction
      const txn = await prisma.walletTransaction.updateMany({
        where: { gatewayTxnId: received_data.ORDERID, status: 'pending' },
        data: { status: 'success' },
      });
      if (txn.count > 0) {
        // Add to user wallet
        const walletTxn = await prisma.walletTransaction.findFirst({ where: { gatewayTxnId: received_data.ORDERID } });
        await prisma.user.update({
          where: { id: walletTxn.userId },
          data: { walletBalance: { increment: walletTxn.amount } },
        });
      }
      return res.send('Wallet top-up successful');
    } else {
      await prisma.walletTransaction.updateMany({
        where: { gatewayTxnId: received_data.ORDERID },
        data: { status: 'failed' },
      });
      return res.send('Payment failed');
    }
  } catch (err) {
    return res.status(500).json({ error: 'Callback error' });
  }
});

const manualTopupStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'public', 'manual-topups');
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const manualTopupUpload = multer({ storage: manualTopupStorage });

// Manual wallet top-up (user uploads screenshot and reference)
router.post('/api/wallet/manual-topup', (req, res, next) => {
  manualTopupUpload.single('screenshot')(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ error: 'File upload failed: ' + err.message });
    }
    (async () => {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { amount, reference } = req.body;
      if (!amount || !reference || !req.file) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      try {
        const txn = await prisma.walletTransaction.create({
          data: {
            userId,
            amount: parseFloat(amount),
            type: 'topup',
            status: 'pending',
            gatewayTxnId: reference,
            screenshotUrl: `/manual-topups/${req.file.filename}`,
          },
        });
        res.json({ success: true, transaction: txn });
      } catch (err) {
        console.error('Manual top-up DB error:', err);
        res.status(500).json({ error: 'Failed to submit manual top-up: ' + err.message });
      }
    })();
  });
});

// Admin: List all pending manual top-ups
router.get('/api/admin/manual-topups', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!await isAdmin(userId)) return res.status(403).json({ error: 'Forbidden: Admin access required' });
  try {
    const topups = await prisma.walletTransaction.findMany({
      where: { type: 'topup', status: 'pending', screenshotUrl: { not: null } },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ topups });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch manual top-ups' });
  }
});

// Admin: Approve/reject manual top-up
router.post('/api/admin/manual-topup/verify', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!await isAdmin(userId)) return res.status(403).json({ error: 'Forbidden: Admin access required' });
  const { id, action } = req.body;
  if (!id || !['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Invalid request' });
  try {
    const txn = await prisma.walletTransaction.findUnique({ where: { id: Number(id) } });
    if (!txn || txn.status !== 'pending') return res.status(400).json({ error: 'Transaction not found or not pending' });
    if (action === 'approve') {
      await prisma.walletTransaction.update({ where: { id: txn.id }, data: { status: 'success' } });
      await prisma.user.update({ where: { id: txn.userId }, data: { walletBalance: { increment: txn.amount } } });
    } else {
      await prisma.walletTransaction.update({ where: { id: txn.id }, data: { status: 'failed' } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Health check endpoint
router.get('/api/health', async (req, res) => {
  try {
    // Try a simple DB query
    await prisma.user.findFirst();
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: e.message });
  }
});

// Generate a unique referral code
const generateReferralCode = () => {
  return 'REF_' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

// POST /api/register
router.post('/api/register', async (req, res) => {
  const { email, password, referralCode } = req.body;
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // If referral code provided, verify it exists
    let referredBy = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (!referrer) {
        return res.status(400).json({ error: 'Invalid referral code.' });
      }
      referredBy = referralCode;
    }

    // Ensure unique referral code
    let newReferralCode;
    let codeExists = true;
    while (codeExists) {
      newReferralCode = generateReferralCode();
      codeExists = await prisma.user.findUnique({ where: { referralCode: newReferralCode } });
    }

    // Create new user with generated referral code
    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        referredBy,
        referralCode: newReferralCode,
      },
    });

    // If user was referred, credit ₹50 to referrer's wallet
    if (referredBy) {
      await prisma.user.update({
        where: { referralCode: referredBy },
        data: { walletBalance: { increment: 50 } },
      });
      // Record the referral bonus transaction
      await prisma.walletTransaction.create({
        data: {
          userId: user.id,
          amount: 50,
          type: 'referral_bonus',
          status: 'success',
          gatewayTxnId: `REF_${Date.now()}`,
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token, user: { email: user.email, id: user.id } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// GET /api/referral-code
router.get('/api/referral-code', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    res.json({ referralCode: user.referralCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referral code.' });
  }
});

// List all pending withdrawals
router.get('/api/admin/pending-withdrawals', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!await isAdmin(userId)) return res.status(403).json({ error: 'Forbidden: Admin access required' });

  try {
    const withdrawals = await prisma.walletTransaction.findMany({
      where: { type: 'withdrawal', status: 'pending' },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ withdrawals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

// POST /api/wallet/withdraw
router.post('/api/wallet/withdraw', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { amount, upi } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Enter a valid amount' });
  }
  if (!upi) {
    return res.status(400).json({ error: 'Enter your UPI ID or bank details' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.walletBalance < Number(amount)) {
    return res.status(400).json({ error: 'Insufficient wallet balance' });
  }
  try {
    // Create a pending withdrawal transaction (do not deduct yet)
    await prisma.walletTransaction.create({
      data: {
        userId,
        amount: Number(amount),
        type: 'withdrawal',
        status: 'pending',
        gatewayTxnId: null,
        screenshotUrl: null,
        upi,
      },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit withdrawal' });
  }
});

// Approve/reject withdrawal
router.post('/api/admin/withdrawal/verify', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!await isAdmin(userId)) return res.status(403).json({ error: 'Forbidden: Admin access required' });
  const { id, action } = req.body;
  if (!id || !['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Invalid request' });
  try {
    const txn = await prisma.walletTransaction.findUnique({ where: { id: Number(id) } });
    if (!txn || txn.status !== 'pending') return res.status(400).json({ error: 'Transaction not found or not pending' });
    if (action === 'approve') {
      // Deduct from user wallet on approval
      const user = await prisma.user.findUnique({ where: { id: txn.userId } });
      if (!user || user.walletBalance < txn.amount) {
        return res.status(400).json({ error: 'User has insufficient balance for withdrawal' });
      }
      await prisma.user.update({ where: { id: txn.userId }, data: { walletBalance: { decrement: txn.amount } } });
      await prisma.walletTransaction.update({ where: { id: txn.id }, data: { status: 'success' } });
    } else {
      await prisma.walletTransaction.update({ where: { id: txn.id }, data: { status: 'failed' } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update withdrawal' });
  }
});

// TEAM ENDPOINTS
// POST /api/team/create
router.post('/api/team/create', async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { name } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    // Check if user is already in a team
    const existing = await prisma.teamMember.findFirst({ where: { userId } });
    if (existing) return res.status(400).json({ error: 'Already in a team' });
    // Create team
    const team = await prisma.team.create({
      data: { name, ownerId: userId }
    });
    // Add owner as first member
    await prisma.teamMember.create({
      data: { teamId: team.id, userId, level: 1, points: 0 }
    });
    res.json({ team });
  } catch (e) {
    console.error('Create team error:', e);
    res.status(500).json({ error: e.message || 'Failed to create team' });
  }
});
// POST /api/team/join
router.post('/api/team/join', async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { teamId } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    // Check if user is already in a team
    const existing = await prisma.teamMember.findFirst({ where: { userId } });
    if (existing) return res.status(400).json({ error: 'Already in a team' });
    // Add to team
    await prisma.teamMember.create({
      data: { teamId, userId, level: 3, points: 0 }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to join team' });
  }
});
// GET /api/team
router.get('/api/team', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const member = await prisma.teamMember.findFirst({ where: { userId }, include: { team: true } });
    if (!member) return res.json({ team: null });
    // Get all members
    const members = await prisma.teamMember.findMany({
      where: { teamId: member.teamId },
      include: { user: true }
    });
    // Calculate team points and levels
    let totalPoints = 0;
    let totalIncome = 0;
    members.forEach(m => {
      totalPoints += m.points;
      totalIncome += m.user.income || 0;
    });
    res.json({ team: member.team, members, totalPoints, totalIncome });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});
// POST /api/team/leave
router.post('/api/team/leave', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    await prisma.teamMember.deleteMany({ where: { userId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to leave team' });
  }
});

module.exports = router;
