/*
  Warnings:

  - A unique constraint covering the columns `[studentProfileId,groupId,month,year]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Payment_month_year_idx";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "groupId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Payment_groupId_idx" ON "Payment"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_studentProfileId_groupId_month_year_key" ON "Payment"("studentProfileId", "groupId", "month", "year");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
