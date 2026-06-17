/*
  Warnings:

  - You are about to drop the `TeacherSalaryPayment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endTime` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `percent` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `salary` on table `TeacherProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- DropForeignKey
ALTER TABLE "TeacherSalaryPayment" DROP CONSTRAINT "TeacherSalaryPayment_teacherId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "days" "WeekDay"[],
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "percent" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL,
ALTER COLUMN "salary" SET NOT NULL;

-- DropTable
DROP TABLE "TeacherSalaryPayment";
