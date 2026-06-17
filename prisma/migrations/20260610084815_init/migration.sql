/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Group` table. All the data in the column will be lost.
  - Added the required column `EndTime` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "EndTime" TEXT NOT NULL,
ADD COLUMN     "days" "WeekDay"[],
ADD COLUMN     "startTime" TEXT NOT NULL;
