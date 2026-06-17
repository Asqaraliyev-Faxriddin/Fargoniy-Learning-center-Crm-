/*
  Warnings:

  - Added the required column `haldAmout` to the `TeacherSalaryPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeacherSalaryPayment" ADD COLUMN     "haldAmout" DOUBLE PRECISION NOT NULL;
