/*
  Warnings:

  - You are about to drop the column `EndTime` on the `Group` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "EndTime",
ADD COLUMN     "endTime" TEXT NOT NULL;
