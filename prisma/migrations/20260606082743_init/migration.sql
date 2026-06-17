-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
ALTER COLUMN "kvitansiya_url" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Payment_studentProfileId_idx" ON "Payment"("studentProfileId");

-- CreateIndex
CREATE INDEX "Payment_month_year_idx" ON "Payment"("month", "year");
