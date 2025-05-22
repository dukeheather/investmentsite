const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestGiftCode() {
  try {
    // Generate a random gift code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create gift code with ₹100 value
    const giftCode = await prisma.giftCode.create({
      data: {
        code,
        amount: 100,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
      }
    });

    console.log('Test Gift Code Created:');
    console.log('Code:', giftCode.code);
    console.log('Amount: ₹', giftCode.amount);
    console.log('Expires:', giftCode.expiresAt);
  } catch (error) {
    console.error('Error creating gift code:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestGiftCode(); 