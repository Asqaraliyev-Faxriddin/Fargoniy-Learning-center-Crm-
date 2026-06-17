/*
  Warnings:

  - You are about to drop the column `days` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `TeacherProfile` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `TeacherProfile` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `TeacherProfile` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `TeacherProfile` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `TeacherProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "days",
DROP COLUMN "endTime",
DROP COLUMN "startTime";

-- AlterTable
ALTER TABLE "TeacherProfile" DROP COLUMN "amount",
DROP COLUMN "isPaid",
DROP COLUMN "month",
DROP COLUMN "paidAt",
DROP COLUMN "year",
ALTER COLUMN "percent" DROP NOT NULL;

-- DropEnum
DROP TYPE "WeekDay";

-- CreateTable
CREATE TABLE "TeacherSalaryPayment" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percent" DOUBLE PRECISION,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherSalaryPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSalaryPayment_teacherId_month_year_key" ON "TeacherSalaryPayment"("teacherId", "month", "year");

-- AddForeignKey
ALTER TABLE "TeacherSalaryPayment" ADD CONSTRAINT "TeacherSalaryPayment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
