import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/core/prisma/prisma.controller";
import {
  CreateAdminDto,
  PaginationQueryDto,
  UpdateAdminDto,
} from "./dto/create-admin.dto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── 1. ADMIN QO'SHISH ────────────────────────────────────────────────────
  async create(dto: CreateAdminDto) {
    // Email takrorlanmasligi
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException("Bu email allaqachon ro'yxatdan o'tgan");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone ?? null,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isEnabled: true,
        createdAt: true,
      },
    });

    return { message: "Admin muvaffaqiyatli qo'shildi", admin: user };
  }

  // ─── 2. BARCHA ADMINLAR (pagination + search) ─────────────────────────────
  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      role: "ADMIN" as const,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [admins, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isEnabled: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: admins,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── 3. BITTA ADMIN ───────────────────────────────────────────────────────
  async findOne(id: string) {
    const admin = await this.prisma.user.findFirst({
      where: { id, role: "ADMIN" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) throw new NotFoundException("Admin topilmadi");
    return admin;
  }

  // ─── 4. ADMIN YANGILASH ───────────────────────────────────────────────────
  async update(id: string, dto: UpdateAdminDto) {
    await this.findOne(id); // mavjudligini tekshirish

    // Email o'zgartirilayotgan bo'lsa takrorlanmasligi
    if (dto.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (emailExists) {
        throw new BadRequestException("Bu email boshqa foydalanuvchida bor");
      }
    }

    const data: any = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isEnabled: true,
        updatedAt: true,
      },
    });

    return { message: "Admin yangilandi", admin: updated };
  }

  // ─── 5. ADMIN O'CHIRISH ───────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });
    return { message: "Admin o'chirildi" };
  }

  // ─── 6. ADMIN FAOLLASHTIRISH / O'CHIRISH ─────────────────────────────────
  async toggleStatus(id: string) {
    const admin = await this.findOne(id);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isEnabled: !admin.isEnabled },
      select: { id: true, isEnabled: true },
    });

    return {
      message: updated.isEnabled ? "Admin faollashtirildi" : "Admin bloklandi",
      isEnabled: updated.isEnabled,
    };
  }

  // ─── 7. STATISTIKA ───────────────────────────────────────────────────────
  async getStatistics() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      // Jami sonlar
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalGroups,
      totalActiveGroups,

      // Bugun qo'shilganlar
      newStudentsToday,
      newTeachersToday,

      // Bugun to'lovlar
      todayPayments,

      // Oylik to'lovlar (joriy oy)
      monthlyPayments,

      // Aktiv/nofaol foydalanuvchilar
      activeUsers,
      inactiveUsers,

      // To'lanmagan oyliklar
      unpaidSalaries,

      // Qisman to'langan oyliklar
      halfSalaries,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: "STUDENT", isEnabled: true } }),
      this.prisma.user.count({ where: { role: "TEACHER", isEnabled: true } }),
      this.prisma.user.count({ where: { role: "ADMIN", isEnabled: true } }),
      this.prisma.group.count(),
      this.prisma.group.count({ where: { isActive: true } }),
      this.prisma.user.count({
        where: {
          role: "STUDENT",
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      this.prisma.user.count({
        where: {
          role: "TEACHER",
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      this.prisma.payment.aggregate({
        where: { paidAt: { gte: todayStart, lte: todayEnd } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.user.count({ where: { isEnabled: true } }),
      this.prisma.user.count({ where: { isEnabled: false } }),

      // ✅ o'zgardi: false → "unpaid"
      this.prisma.teacherSalaryPayment.count({
        where: {
          isPaid: "unpaid",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      }),

      // ✅ yangi: qisman to'langan
      this.prisma.teacherSalaryPayment.count({
        where: {
          isPaid: "half",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      }),
    ]);

    return {
      users: {
        totalStudents,
        totalTeachers,
        totalAdmins,
        activeUsers,
        inactiveUsers,
      },
      today: {
        newStudents: newStudentsToday,
        newTeachers: newTeachersToday,
        paymentsCount: todayPayments._count,
        paymentsAmount: todayPayments._sum.amount ?? 0,
      },
      groups: {
        total: totalGroups,
        active: totalActiveGroups,
        inactive: totalGroups - totalActiveGroups,
      },
      finance: {
        currentMonthPaymentsCount: monthlyPayments._count,
        currentMonthPaymentsAmount: monthlyPayments._sum.amount ?? 0,
        unpaidTeacherSalaries: unpaidSalaries,            // hali umuman to'lanmagan
        halfPaidTeacherSalaries: halfSalaries,             // qisman to'langan
        pendingTeacherSalaries: unpaidSalaries + halfSalaries, // jami muammoli
      },
    };
  }
}