const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');
const crypto = require('crypto');

// Generate a unique referral code
const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Get user's referral data
router.get('/', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        referrals: true
      }
    });

    if (!user.referralCode) {
      // Generate and save referral code if user doesn't have one
      const referralCode = generateReferralCode();
      await prisma.user.update({
        where: { id: req.user.id },
        data: { referralCode }
      });
      user.referralCode = referralCode;
    }

    res.json({
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings,
      referrals: user.referrals,
      referralLevel: user.referralLevel,
      referralPoints: user.referralPoints
    });
  } catch (error) {
    console.error('Error fetching referral data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply referral code during registration
router.post('/apply', async (req, res) => {
  const { referralCode, email } = req.body;

  try {
    const referrer = await prisma.user.findUnique({
      where: { referralCode }
    });

    if (!referrer) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    // Update the new user with the referrer's code
    await prisma.user.update({
      where: { email },
      data: { referredBy: referralCode }
    });

    // Create a new referral record
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredUser: email,
        status: 'pending'
      }
    });

    // Credit ₹50 to referrer's wallet and referralEarnings
    await prisma.user.update({
      where: { id: referrer.id },
      data: {
        walletBalance: { increment: 50 },
        referralEarnings: { increment: 50 }
      }
    });
    // Create a wallet transaction for the bonus
    await prisma.walletTransaction.create({
      data: {
        userId: referrer.id,
        amount: 50,
        type: 'referral_bonus',
        status: 'success',
        gatewayTxnId: `REFBONUS_${Date.now()}`
      }
    });

    res.json({ message: 'Referral code applied successfully' });
  } catch (error) {
    console.error('Error applying referral code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process commission when a referred user makes a recharge
router.post('/process-commission', auth, async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user.referredBy) {
      return res.status(400).json({ error: 'User was not referred' });
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode: user.referredBy }
    });

    if (!referrer) {
      return res.status(400).json({ error: 'Referrer not found' });
    }

    // Determine commission rate by level
    let commissionRate = 0.03;
    if (referrer.referralLevel >= 3) commissionRate = 0.10;
    else if (referrer.referralLevel === 2) commissionRate = 0.05;
    // else Level 1: 0.03
    const commission = amount * commissionRate;

    // Update referrer's earnings and points
    let newPoints = referrer.referralPoints + 1;
    let newLevel = referrer.referralLevel;
    if (newPoints >= 20) newLevel = 3;
    else if (newPoints >= 5) newLevel = 2;
    else newLevel = 1;

    await prisma.user.update({
      where: { id: referrer.id },
      data: {
        referralEarnings: { increment: commission },
        walletBalance: { increment: commission },
        referralPoints: newPoints,
        referralLevel: newLevel
      }
    });

    // Update referral status
    await prisma.referral.updateMany({
      where: {
        referrerId: referrer.id,
        referredUser: user.email
      },
      data: {
        status: 'completed',
        commission: { increment: commission }
      }
    });

    res.json({ message: 'Commission processed successfully', commission, newLevel, newPoints });
  } catch (error) {
    console.error('Error processing commission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 