/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- Step 1: Add optional referralCode column
ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;

-- Step 2: Generate and populate referral codes for existing users
UPDATE "User"
SET "referralCode" = 'REF_' || id || '_' || floor(random() * 1000000)::text
WHERE "referralCode" IS NULL;

-- Step 3: Make referralCode required and unique
ALTER TABLE "User" ALTER COLUMN "referralCode" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_referralCode_key" UNIQUE ("referralCode");

-- Add referredBy column
ALTER TABLE "User" ADD COLUMN "referredBy" TEXT;
