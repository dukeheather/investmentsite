const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const PaytmChecksum = require('paytmchecksum');
const axios = require('axios');
const multer = require('multer');
const path = require('path');

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
    cb(null, path.join(__dirname, '..', 'public', 'manual-topups'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const manualTopupUpload = multer({ storage: manualTopupStorage });

// Manual wallet top-up (user uploads screenshot and reference)
router.post('/api/wallet/manual-topup', manualTopupUpload.single('screenshot'), async (req, res) => {
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
    res.status(500).json({ error: 'Failed to submit manual top-up' });
  }
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

module.exports = router;
