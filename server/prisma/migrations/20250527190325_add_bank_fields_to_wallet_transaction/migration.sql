-- AlterTable
ALTER TABLE "WalletTransaction" ADD COLUMN     "accountHolder" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "ifsc" TEXT;
