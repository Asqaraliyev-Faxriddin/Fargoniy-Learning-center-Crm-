/*
  Warnings:

  - Added the required column `kvitansiya_url` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "kvitansiya_url" TEXT NOT NULL;
