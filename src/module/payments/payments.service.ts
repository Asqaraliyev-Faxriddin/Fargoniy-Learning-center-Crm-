import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.controller';
import { PaymentStatus, Prisma } from '@prisma/client';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  DeletePaymentDto,
  PaymentQueryDto,
  PaymentStatisticsDto,
} from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  /* ============================================================
     PRIVATE: Status va haldAmout hisoblash
     amountPaid >= price      → PAID,    haldAmout = 0
     0 < amountPaid < price   → PARTIAL, haldAmout = price - amountPaid
     amountPaid === 0         → UNPAID,  haldAmout = price
  ============================================================ */
  private resolveStatus(
    amountPaid: number,
    subjectPrice: number,
  ): { status: PaymentStatus; haldAmout: number } {
    if (amountPaid >= subjectPrice) {
      return { status: PaymentStatus.PAID, haldAmout: 0 };
    }
    if (amountPaid > 0) {
      return { status: PaymentStatus.PARTIAL, haldAmout: subjectPrice - amountPaid };
    }
    return { status: PaymentStatus.UNPAID, haldAmout: subjectPrice };
  }

  /* ============================================================
     CREATE PAYMENT
  ============================================================ */
  async createPayment(dto: CreatePaymentDto, createdById: string) {
    const [studentProfile, group] = await Promise.all([
      this.prisma.studentProfile.findUnique({
        where: { id: dto.studentProfileId },
        include: { user: true },
      }),
      this.prisma.group.findUnique({
        where: { id: dto.groupId },
        include: { subject: true },
      }),
    ]);

    if (!studentProfile) throw new NotFoundException('Talaba profili topilmadi');
    if (!group) throw new NotFoundException('Guruh topilmadi');

    // Talaba shu guruhda o'qishini tekshirish
    const membership = await this.prisma.groupStudent.findUnique({
      where: {
        groupId_studentProfileId: {
          groupId: dto.groupId,
          studentProfileId: dto.studentProfileId,
        },
      },
    });
    if (!membership) {
      throw new BadRequestException("Talaba bu guruhda yo'q");
    }

    const subjectPrice = group.subject.price;

    // amountPaid fan narxidan ko'p bo'lsa xatolik
    if (dto.amountPaid > subjectPrice) {
      throw new BadRequestException(
        `To'lov summasi (${dto.amountPaid}) fan narxidan (${subjectPrice}) ko'p bo'lishi mumkin emas`,
      );
    }

    // Duplicate tekshirish
    const existing = await this.prisma.payment.findUnique({
      where: {
        studentProfileId_groupId_month_year: {
          studentProfileId: dto.studentProfileId,
          groupId: dto.groupId,
          month: dto.month,
          year: dto.year,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        `${dto.year}-yil ${dto.month}-oy uchun to'lov allaqachon mavjud`,
      );
    }

    const { status, haldAmout } = this.resolveStatus(dto.amountPaid, subjectPrice);

    return this.prisma.payment.create({
      data: {
        studentProfileId: dto.studentProfileId,
        groupId: dto.groupId,
        amount: dto.amountPaid,
        haldAmout,
        month: dto.month,
        year: dto.year,
        status,
        paymentMethod: dto.paymentMethod ?? 'CASH',
        createdById,
      },
      include: {
        studentProfile: { include: { user: true } },
        group: {
          include: {
            subject: true,
            teacher: { include: { user: true } },
          },
        },
      },
    });
  }

  /* ============================================================
     UPDATE PAYMENT
     Qo'shimcha summa to'lansa: amount += amountPaid, haldAmout qayta hisoblanadi
  ============================================================ */
  async updatePayment(id: string, dto: UpdatePaymentDto) {
    const current = await this.findOneOrFail(id);

    if (current.status === PaymentStatus.PAID) {
      throw new BadRequestException("Bu to'lov allaqachon to'liq to'langan");
    }

    let updatedAmount = current.amount;
    let status: PaymentStatus = current.status;
    let haldAmout = current.haldAmout;

    if (dto.amountPaid !== undefined) {
      const group = await this.prisma.group.findUnique({
        where: { id: current.groupId },
        include: { subject: true },
      });
      const subjectPrice = group!.subject.price;

      // Qo'shimcha to'lov qoldiqdan oshib ketmasligi kerak
      if (dto.amountPaid > current.haldAmout) {
        throw new BadRequestException(
          `Kiritilgan summa (${dto.amountPaid}) qolgan qarzdan (${current.haldAmout}) ko'p`,
        );
      }

      updatedAmount = current.amount + dto.amountPaid;
      const resolved = this.resolveStatus(updatedAmount, subjectPrice);
      status = resolved.status;
      haldAmout = resolved.haldAmout;
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        amount: updatedAmount,
        haldAmout,
        status,
        ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod }),
      },
      include: {
        studentProfile: { include: { user: true } },
        group: { include: { subject: true } },
      },
    });
  }

  /* ============================================================
     DELETE PAYMENT
  ============================================================ */
  async deletePayment(dto: DeletePaymentDto) {
    await this.findOneOrFail(dto.paymentId);
    await this.prisma.payment.delete({ where: { id: dto.paymentId } });
    return { message: "To'lov muvaffaqiyatli o'chirildi", id: dto.paymentId };
  }

  /* ============================================================
     GET ONE PAYMENT
  ============================================================ */
  async getPaymentById(id: string) {
    return this.findOneOrFail(id);
  }

  /* ============================================================
     GET ALL PAYMENTS (Pagination + Filters)
  ============================================================ */
  async getAllPayments(query: PaymentQueryDto) {
    const {
      studentProfileId,
      groupId,
      firstName,
      phone,
      status,
      startDate,
      endDate,
      page,
      limit,
    } = query;

    const where: Prisma.PaymentWhereInput = {};

    if (studentProfileId) where.studentProfileId = studentProfileId;
    if (groupId) where.groupId = groupId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) where.paidAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.paidAt.lte = end;
      }
    }

    if (firstName || phone) {
      where.studentProfile = {
        user: {
          ...(firstName && {
            firstName: { contains: firstName, mode: 'insensitive' },
          }),
          ...(phone && { phone: { contains: phone } }),
        },
      };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { paidAt: 'desc' }],
        include: {
          studentProfile: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
          group: {
            include: {
              subject: { select: { name: true } },
              teacher: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasPreviousPage: page > 1,
        hasNextPage: page * limit < total,
      },
    };
  }

  /* ============================================================
     TALABA TO'LOV HOLATI
  ============================================================ */
  async getStudentPaymentSummary(
    studentProfileId: string,
    groupId?: string,
    fromYear?: number,
    fromMonth?: number,
    toYear?: number,
    toMonth?: number,
  ) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
        groups: {
          include: {
            group: {
              include: { subject: { select: { name: true, price: true } } },
            },
          },
        },
      },
    });

    if (!studentProfile) throw new NotFoundException('Talaba topilmadi');

    const targetGroups = groupId
      ? studentProfile.groups.filter((g) => g.groupId === groupId)
      : studentProfile.groups;

    if (targetGroups.length === 0) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const groupSummaries = await Promise.all(
      targetGroups.map(async (gs) => {
        const group = gs.group;
        const joinedAt = gs.joinedAt;
        const startYear = fromYear ?? joinedAt.getFullYear();
        const startMonth = fromMonth ?? joinedAt.getMonth() + 1;
        const endYear = toYear ?? currentYear;
        const endMonth = toMonth ?? currentMonth;

        const payments = await this.prisma.payment.findMany({
          where: { studentProfileId, groupId: group.id },
          orderBy: [{ year: 'asc' }, { month: 'asc' }],
        });

        const paymentMap = new Map<string, (typeof payments)[0]>();
        for (const p of payments) {
          paymentMap.set(`${p.year}-${p.month}`, p);
        }

        const allMonths: {
          year: number;
          month: number;
          key: string;
          status: PaymentStatus | 'MISSING';
          amount: number | null;
          haldAmout: number | null;
          paidAt: Date | null;
          paymentId: string | null;
        }[] = [];

        let y = startYear;
        let m = startMonth;
        while (y < endYear || (y === endYear && m <= endMonth)) {
          const key = `${y}-${m}`;
          const payment = paymentMap.get(key);
          allMonths.push({
            year: y,
            month: m,
            key,
            status: payment ? payment.status : 'MISSING',
            amount: payment ? payment.amount : null,
            haldAmout: payment ? payment.haldAmout : null,
            paidAt: payment ? payment.paidAt : null,
            paymentId: payment ? payment.id : null,
          });
          if (m === 12) { m = 1; y++; } else { m++; }
        }

        const paidMonths = allMonths.filter((x) => x.status === PaymentStatus.PAID);
        const partialMonths = allMonths.filter((x) => x.status === PaymentStatus.PARTIAL);
        const unpaidOrMissingMonths = allMonths.filter(
          (x) => x.status === PaymentStatus.UNPAID || x.status === 'MISSING',
        );

        const totalPaidAmount = paidMonths.reduce((sum, x) => sum + (x.amount ?? 0), 0);
        const totalPartialAmount = partialMonths.reduce((sum, x) => sum + (x.amount ?? 0), 0);
        const subjectPrice = group.subject.price;

        const totalDebt =
          unpaidOrMissingMonths.length * subjectPrice +
          partialMonths.reduce((sum, x) => sum + (x.haldAmout ?? 0), 0);

        return {
          groupId: group.id,
          groupName: group.name,
          subjectName: group.subject.name,
          subjectMonthlyPrice: subjectPrice,
          joinedAt,
          summary: {
            totalMonths: allMonths.length,
            paidMonthsCount: paidMonths.length,
            partialMonthsCount: partialMonths.length,
            unpaidMonthsCount: unpaidOrMissingMonths.length,
            totalPaidAmount,
            totalPartialAmount,
            totalDebt,
            totalExpected: allMonths.length * subjectPrice,
          },
          months: {
            all: allMonths,
            paid: paidMonths,
            partial: partialMonths,
            unpaidOrMissing: unpaidOrMissingMonths,
          },
        };
      }),
    );

    const overall = {
      totalDebt: groupSummaries.reduce((s, g) => s + g.summary.totalDebt, 0),
      totalPaid: groupSummaries.reduce((s, g) => s + g.summary.totalPaidAmount, 0),
      totalExpected: groupSummaries.reduce((s, g) => s + g.summary.totalExpected, 0),
      totalUnpaidMonths: groupSummaries.reduce(
        (s, g) => s + g.summary.unpaidMonthsCount,
        0,
      ),
    };

    return {
      student: {
        id: studentProfileId,
        firstName: studentProfile.user.firstName,
        lastName: studentProfile.user.lastName,
        phone: studentProfile.user.phone,
      },
      overall,
      groups: groupSummaries,
    };
  }

  /* ============================================================
     PAYMENT STATISTICS
  ============================================================ */
  async getPaymentStatistics(dto: PaymentStatisticsDto) {
    const { month, year, groupId } = dto;

    const where: Prisma.PaymentWhereInput = {};
    if (month) where.month = month;
    if (year) where.year = year;
    if (groupId) where.groupId = groupId;

    const [payments, groupedByStatus] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        select: { amount: true, haldAmout: true, status: true, month: true, year: true },
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        where,
        _sum: { amount: true, haldAmout: true },
        _count: { id: true },
      }),
    ]);

    const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
    const totalDebt = payments.reduce((s, p) => s + (p.haldAmout ?? 0), 0);
    const totalCount = payments.length;

    const byStatus = Object.fromEntries(
      groupedByStatus.map((g) => [
        g.status,
        {
          count: g._count.id,
          totalAmount: g._sum.amount ?? 0,
          totalDebt: g._sum.haldAmout ?? 0,
        },
      ]),
    );

    let monthlyBreakdown: Record<
      number,
      { count: number; totalAmount: number; totalDebt: number }
    > | null = null;

    if (year && !month) {
      const monthlyData = await this.prisma.payment.groupBy({
        by: ['month'],
        where,
        _sum: { amount: true, haldAmout: true },
        _count: { id: true },
        orderBy: { month: 'asc' },
      });
      monthlyBreakdown = Object.fromEntries(
        monthlyData.map((m) => [
          m.month,
          {
            count: m._count.id,
            totalAmount: m._sum.amount ?? 0,
            totalDebt: m._sum.haldAmout ?? 0,
          },
        ]),
      );
    }

    return {
      filters: { month, year, groupId },
      totalCount,
      totalAmount,
      totalDebt,
      byStatus,
      monthlyBreakdown,
    };
  }

  /* ============================================================
     GURUH TO'LOV RO'YXATI
  ============================================================ */
  async getGroupPaymentStatus(groupId: string, month: number, year: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        subject: true,
        students: {
          include: {
            studentProfile: {
              include: {
                user: { select: { firstName: true, lastName: true, phone: true } },
                payments: { where: { groupId, month, year } },
              },
            },
          },
        },
      },
    });

    if (!group) throw new NotFoundException('Guruh topilmadi');

    const result = group.students.map((gs) => {
      const payment = gs.studentProfile.payments[0] ?? null;
      return {
        studentProfileId: gs.studentProfileId,
        student: {
          firstName: gs.studentProfile.user.firstName,
          lastName: gs.studentProfile.user.lastName,
          phone: gs.studentProfile.user.phone,
        },
        payment: payment
          ? {
              id: payment.id,
              amount: payment.amount,
              haldAmout: payment.haldAmout,
              status: payment.status,
              paidAt: payment.paidAt,
              paymentMethod: payment.paymentMethod,
            }
          : null,
        hasPaid: !!payment,
        status: payment ? payment.status : PaymentStatus.UNPAID,
        debt: payment ? payment.haldAmout : group.subject.price,
      };
    });

    const paid = result.filter((r) => r.status === PaymentStatus.PAID);
    const partial = result.filter((r) => r.status === PaymentStatus.PARTIAL);
    const unpaid = result.filter(
      (r) => !r.hasPaid || r.status === PaymentStatus.UNPAID,
    );

    return {
      group: {
        id: group.id,
        name: group.name,
        subject: group.subject.name,
        monthlyPrice: group.subject.price,
      },
      period: { month, year },
      summary: {
        totalStudents: result.length,
        paidCount: paid.length,
        partialCount: partial.length,
        unpaidCount: unpaid.length,
        totalCollected: result.reduce((s, r) => s + (r.payment?.amount ?? 0), 0),
        totalExpected: result.length * group.subject.price,
        totalDebt: result.reduce((s, r) => s + r.debt, 0),
      },
      students: { paid, partial, unpaid },
    };
  }

  /* ============================================================
     PRIVATE HELPER
  ============================================================ */
  private async findOneOrFail(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        group: {
          include: {
            subject: { select: { name: true, price: true } },
            teacher: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
    if (!payment) throw new NotFoundException(`To'lov topilmadi (id: ${id})`);
    return payment;
  }
}