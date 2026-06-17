import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.controller";
import {
  CreateTeacherSalaryDto,
  GetSalaryQueryDto,
} from "./dto/create-teacher-price.dto";

@Injectable()
export class TeacherSalaryService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── 1. HISOBLASH ────────────────────────────────────────────────────────────
  /**
   * O'qituvchi oyligini hisoblaydi (saqlamaydi).
   *
   * Rejimlar:
   *  • FIXED   – TeacherProfile.salary > 0  →  shu miqdor to'g'ridan-to'g'ri qaytadi
   *  • PERCENT – TeacherProfile.percent yoki so'rovdan kelgan percent ishlatiladi
   *              Har bir guruh uchun: subject.price × activeStudentCount × (percent/100)
   */
  async calculateSalary(
    teacherId: string,
    month: number,
    year: number,
    fallbackPercent?: number,
  ) {
    // 1. O'qituvchini guruhlari va fan ma'lumotlari bilan olish
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        groups: {
          where: { isActive: true },
          include: {
            subject: true,
            students: true,
          },
        },
      },
    });

    if (!teacherProfile) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    // 2. Mavjud to'lov yozuvini tekshirish
    const existingPayment =
      await this.prisma.teacherSalaryPayment.findUnique({
        where: { teacherId_month_year: { teacherId, month, year } },
      });

    // 3. Rejimni aniqlash
    const isFixedSalary = (teacherProfile.salary ?? 0) > 0;

    let calculatedSalary = 0;
    let salaryBreakdown: {
      groupId: string;
      groupName: string;
      subjectName: string;
      subjectPrice: number;
      studentCount: number;
      totalGroupIncome: number;
      percent: number;
      groupEarning: number;
    }[] = [];

    if (isFixedSalary) {
      // ── FIXED REJIM ──────────────────────────────────────────────────────────
      calculatedSalary = teacherProfile.salary!;
    } else {
      // ── PERCENT REJIM ────────────────────────────────────────────────────────
      const percent =
        existingPayment?.percent && existingPayment.percent > 0
          ? existingPayment.percent
          : teacherProfile.percent && teacherProfile.percent > 0
          ? teacherProfile.percent
          : (fallbackPercent ?? 0);

      let total = 0;

      for (const group of teacherProfile.groups) {
        const studentCount = group.students.length;
        const subjectPrice = group.subject.price;
        const totalGroupIncome = subjectPrice * studentCount;
        const groupEarning = totalGroupIncome * (percent / 100);

        total += groupEarning;

        salaryBreakdown.push({
          groupId: group.id,
          groupName: group.name,
          subjectName: group.subject.name,
          subjectPrice,
          studentCount,
          totalGroupIncome,
          percent,
          groupEarning,
        });
      }

      calculatedSalary = total;
    }

    // 4. Oldingi to'lovdan qolgan summa (haldAmount) ni hisobga olish
    //    Agar avval "half" to'langan bo'lsa, haldAmount = qolgan qism
    const previouslyPaid =
      existingPayment && existingPayment.isPaid !== "unpaid"
        ? existingPayment.amount   // shu oygacha to'langan jami summa
        : 0;

    const remainingAmount =
      existingPayment?.isPaid === "half"
        ? (existingPayment.haldAmout ?? calculatedSalary)
        : calculatedSalary;

    return {
      teacherId,
      teacherName: `${teacherProfile.user.firstName} ${teacherProfile.user.lastName}`,
      month,
      year,
      mode: isFixedSalary ? "FIXED" : "PERCENT",
      fixedSalary: isFixedSalary ? (teacherProfile.salary ?? null) : null,
      profilePercent: !isFixedSalary ? (teacherProfile.percent ?? null) : null,
      calculatedSalary,          // jami oylik
      previouslyPaid,            // avval to'langan summa
      remainingAmount,           // hali to'lanmagan qoldiq
      salaryBreakdown: isFixedSalary ? [] : salaryBreakdown,
      isPaid: existingPayment?.isPaid ?? "unpaid",
      paidAt: existingPayment?.paidAt ?? null,
      existingPaymentId: existingPayment?.id ?? null,
    };
  }

  // ─── 2. TO'LOV YARATISH ───────────────────────────────────────────────────────
  /**
   * Oylikni hisoblaydi va to'lovni DB ga saqlaydi.
   *
   * amountPaid mantiq:
   *  • amountPaid > remainingAmount  →  BadRequestException
   *  • amountPaid === remainingAmount →  isPaid = "paid",  haldAmount = 0
   *  • amountPaid < remainingAmount  →  isPaid = "half",  haldAmount = remainingAmount - amountPaid
   */
  async createSalaryPayment(dto: CreateTeacherSalaryDto) {
    const { teacherId, month, year, percent, amountPaid } = dto;

    const calculated = await this.calculateSalary(
      teacherId,
      month,
      year,
      percent,
    );

    // ── Allaqachon to'liq to'langan bo'lsa ────────────────────────────────────
    if (calculated.isPaid === "paid") {
      throw new BadRequestException(
        `${month}/${year} uchun oylik allaqachon to'liq to'langan`,
      );
    }

    const remaining = calculated.remainingAmount;

    // ── amountPaid qoldiqdan oshib ketsa ──────────────────────────────────────
    if (amountPaid > remaining) {
      throw new BadRequestException(
        `Kiritilgan summa (${amountPaid}) o'qituvchining qolgan oyligidan (${remaining}) ko'p. ` +
          `O'qituvchi oyligi: ${calculated.calculatedSalary}`,
      );
    }

    // ── To'lov holatini aniqlash ───────────────────────────────────────────────
    const newHaldAmount = remaining - amountPaid;
    const newIsPaid = newHaldAmount === 0 ? "paid" : "half";

    // Jami to'langan summa (avvalgisi + hozirgi)
    const totalPaidSoFar = calculated.previouslyPaid + amountPaid;

    // ── Foizni aniqlash (FIXED rejimda null saqlanadi) ─────────────────────────
    const resolvedPercent =
      calculated.mode === "PERCENT"
        ? (percent ?? calculated.profilePercent ?? 0)
        : null;

    const salaryPayment = await this.prisma.teacherSalaryPayment.upsert({
      where: { teacherId_month_year: { teacherId, month, year } },
      create: {
        teacherId,
        month,
        year,
        percent: resolvedPercent,
        amount: totalPaidSoFar,
        salary: calculated.calculatedSalary,
        isPaid: newIsPaid,
        haldAmout: newHaldAmount,
        paidAt: newIsPaid === "paid" ? new Date() : null,
      },
      update: {
        amount: totalPaidSoFar,
        salary: calculated.calculatedSalary,
        percent: resolvedPercent,
        isPaid: newIsPaid,
        haldAmout: newHaldAmount,
        paidAt: newIsPaid === "paid" ? new Date() : null,
      },
    });

    return {
      message:
        newIsPaid === "paid"
          ? "Oylik to'liq to'landi ✅"
          : `Oylik qisman to'landi. Qoldiq: ${newHaldAmount} ⚠️`,
      payment: salaryPayment,
      breakdown: calculated.salaryBreakdown,
      summary: {
        calculatedSalary: calculated.calculatedSalary,
        previouslyPaid: calculated.previouslyPaid,
        paidNow: amountPaid,
        totalPaid: totalPaidSoFar,
        remainingAfter: newHaldAmount,
        status: newIsPaid,
      },
    };
  }

  // ─── 3. BARCHA O'QITUVCHILAR HOLATI ──────────────────────────────────────────
  async getAllTeachersSalaryStatus(query: GetSalaryQueryDto) {
    const { month, year, percent: fallbackPercent } = query;

    const teachers = await this.prisma.teacherProfile.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true, isEnabled: true },
        },
        groups: { where: { isActive: true } },
      },
    });

    const result = await Promise.all(
      teachers.map(async (teacher) => {
        const calculated = await this.calculateSalary(
          teacher.id,
          month,
          year,
          fallbackPercent,
        );

        return {
          teacherId: teacher.id,
          teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`,
          isEnabled: teacher.user.isEnabled,
          mode: calculated.mode,
          activeGroupsCount: teacher.groups.length,
          calculatedSalary: calculated.calculatedSalary,
          previouslyPaid: calculated.previouslyPaid,
          remainingAmount: calculated.remainingAmount,
          isPaid: calculated.isPaid,
          paidAt: calculated.paidAt,
        };
      }),
    );

    return {
      month,
      year,
      teachers: result,
      totalPaid: result.filter((t) => t.isPaid === "paid").length,
      totalHalf: result.filter((t) => t.isPaid === "half").length,
      totalUnpaid: result.filter((t) => t.isPaid === "unpaid").length,
      totalSalaryAmount: result.reduce(
        (sum, t) => sum + t.calculatedSalary,
        0,
      ),
      totalRemainingAmount: result.reduce(
        (sum, t) => sum + t.remainingAmount,
        0,
      ),
    };
  }

  // ─── 4. BITTA O'QITUVCHI OYLIK TARIXI ────────────────────────────────────────
  async getTeacherSalaryHistory(teacherId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    const payments = await this.prisma.teacherSalaryPayment.findMany({
      where: { teacherId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return {
      teacherId,
      teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`,
      totalPayments: payments.length,
      payments,
    };
  }

  // ─── 5. PREVIEW (saqlash kerak emas) ─────────────────────────────────────────
  async previewSalary(
    teacherId: string,
    month: number,
    year: number,
    percent?: number,
  ) {
    return this.calculateSalary(teacherId, month, year, percent);
  }
}