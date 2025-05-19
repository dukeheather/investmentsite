const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Configure multer for this route
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// POST /api/upload/payment-screenshot
router.post('/payment-screenshot', upload.single('screenshot'), async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { investmentId } = req.body;
  if (!investmentId) {
    return res.status(400).json({ error: 'Investment ID is required' });
  }

  try {
    // Update the investment with the screenshot URL
    const screenshotUrl = `/uploads/${req.file.filename}`;
    const investment = await prisma.investment.update({
      where: {
        id: parseInt(investmentId),
        userId: userId // Ensure the investment belongs to the user
      },
      data: {
        screenshotUrl: screenshotUrl,
        status: 'pending_verification'
      }
    });

    res.json({ 
      success: true, 
      investment,
      message: 'Payment screenshot uploaded successfully. Waiting for verification.'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to update investment with screenshot' });
  }
});

// POST /api/purchase-with-screenshot
router.post('/purchase-with-screenshot', upload.single('screenshot'), async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { planName, amount, transactionId, notes } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'Payment screenshot is required.' });
  }
  const screenshotUrl = `/uploads/${req.file.filename}`;

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

  try {
    const investment = await prisma.investment.create({
      data: {
        userId,
        planName,
        amount: amountNum,
        status: 'pending_verification',
        transactionId,
        notes,
        screenshotUrl: screenshotUrl,
      },
    });
    res.json({ success: true, investment, message: 'Investment submitted and awaiting admin verification.' });
  } catch (error) {
    console.error('Upload error in /purchase-with-screenshot:', error);
    console.error('Request body:', req.body);
    if (req.file) {
      console.error('Uploaded file info:', req.file);
    } else {
      console.error('No file uploaded.');
    }
    res.status(500).json({ error: 'Failed to create investment (upload).' });
  }
});

module.exports = router; 