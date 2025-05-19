const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

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

// POST /api/purchase
router.post('/api/purchase', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { planName, amount, transactionId, notes, screenshotUrl } = req.body;

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

  // UTR ID validation: must be a string of up to 12 digits
  if (!/^[0-9]{1,12}$/.test(transactionId)) {
    return res.status(400).json({ error: 'UTR ID must be a number up to 12 digits.' });
  }

  // Screenshot required
  if (!screenshotUrl) {
    return res.status(400).json({ error: 'Payment screenshot is required.' });
  }

  try {
    const investment = await prisma.investment.create({
      data: {
        userId,
        planName,
        amount: amountNum,
        status: 'pending_verification',
        transactionId,
        notes,
        screenshotUrl,
      },
    });
    res.json({ success: true, investment });
  } catch (e) {
    res.status(500).json({ error: 'Failed to purchase plan.' });
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

module.exports = router;
