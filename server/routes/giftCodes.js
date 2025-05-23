const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authMiddleware } = require('./auth');

// Redeem gift code
router.post('/redeem', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // Find the gift code
    const giftCode = await prisma.giftCode.findUnique({
      where: { code }
    });

    if (!giftCode) {
      return res.status(404).json({ error: 'Invalid gift code' });
    }

    if (giftCode.isUsed) {
      return res.status(400).json({ error: 'Gift code has already been used' });
    }

    if (giftCode.expiresAt && giftCode.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Gift code has expired' });
    }

    // Start a transaction to update both gift code and user wallet
    const result = await prisma.$transaction(async (prisma) => {
      // Mark gift code as used
      await prisma.giftCode.update({
        where: { id: giftCode.id },
        data: {
          isUsed: true,
          usedBy: userId,
          usedAt: new Date()
        }
      });

      // Update user's wallet balance
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: giftCode.amount
          }
        }
      });

      // Create wallet transaction record
      await prisma.walletTransaction.create({
        data: {
          userId,
          amount: giftCode.amount,
          type: 'topup',
          status: 'success',
          gatewayTxnId: `GIFT-${giftCode.id}`
        }
      });

      return updatedUser;
    });

    res.json({
      success: true,
      message: 'Gift code redeemed successfully',
      newBalance: result.walletBalance
    });
  } catch (error) {
    console.error('Error redeeming gift code:', error);
    res.status(500).json({ error: 'Failed to redeem gift code' });
  }
});

// Admin route to create gift codes
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { amount, expiresAt } = req.body;
    const userId = req.user.id;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Only admins can create gift codes' });
    }

    // Generate a random gift code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const giftCode = await prisma.giftCode.create({
      data: {
        code,
        amount: parseFloat(amount),
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.json({
      success: true,
      giftCode
    });
  } catch (error) {
    console.error('Error creating gift code:', error);
    res.status(500).json({ error: 'Failed to create gift code' });
  }
});

// Admin GET endpoint to create a gift code (for quick testing)
router.get('/admin-create', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount = 100, expiresAt } = req.query;
    // Check if user is admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Only admins can create gift codes' });
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const giftCode = await prisma.giftCode.create({
      data: {
        code,
        amount: parseFloat(amount),
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });
    res.json({ success: true, giftCode });
  } catch (error) {
    console.error('Error creating gift code:', error);
    res.status(500).json({ error: 'Failed to create gift code' });
  }
});

module.exports = router; 