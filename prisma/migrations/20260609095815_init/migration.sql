-- CreateTable
CREATE TABLE "TeacherSalaryPayment" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherSalaryPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSalaryPayment_teacherId_month_year_key" ON "TeacherSalaryPayment"("teacherId", "month", "year");

-- AddForeignKey
ALTER TABLE "TeacherSalaryPayment" ADD CONSTRAINT "TeacherSalaryPayment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
