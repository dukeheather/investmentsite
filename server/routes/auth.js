const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Register
router.post('/register', async (req, res) => {
  const { email, password, phone, referralCode } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) return res.status(400).json({ error: 'Email or phone already registered' });

    // Referral code logic
    let referredBy = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (!referrer) {
        return res.status(400).json({ error: 'Invalid referral code.' });
      }
      referredBy = referralCode;
    }

    // Generate unique referral code
    const generateReferralCode = () => {
      return 'REF_' + Math.random().toString(36).substr(2, 8).toUpperCase();
    };
    let newReferralCode;
    let codeExists = true;
    while (codeExists) {
      newReferralCode = generateReferralCode();
      codeExists = await prisma.user.findUnique({ where: { referralCode: newReferralCode } });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, phone, referredBy, referralCode: newReferralCode },
    });

    // Credit referrer if applicable
    if (referredBy) {
      await prisma.user.update({
        where: { referralCode: referredBy },
        data: { walletBalance: { increment: 50 } },
      });
      // Optionally, log this as a transaction
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

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Update profile
router.post('/user/profile', authMiddleware, async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email, phone },
    });
    res.json({ success: true, name: user.name, email: user.email, phone: user.phone });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = {
  router,
  authMiddleware
}; 