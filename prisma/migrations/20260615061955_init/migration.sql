/*
  Warnings:

  - The `isPaid` column on the `TeacherSalaryPayment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "IsPaid" AS ENUM ('paid', 'unpaid', 'half');

-- AlterTable
ALTER TABLE "TeacherSalaryPayment" DROP COLUMN "isPaid",
ADD COLUMN     "isPaid" "IsPaid" NOT NULL DEFAULT 'unpaid';
