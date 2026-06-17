  import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/core/prisma/prisma.controller';
  import * as bcrypt from 'bcrypt';
  import { Prisma } from '@prisma/client';
  import {
    CreateStudentDto, 
    UpdateStudentDto,
    AddStudentToGroupDto,
    RemoveStudentFromGroupDto,
    StudentQueryDto,
  } from './dto/create-student.dto';

  @Injectable()
  export class StudentService {
    constructor(private  prisma: PrismaService) {}

    /* ============================================================
      CREATE STUDENT
      - Email bazaga "" (bo'sh string) saqlanadi
      - Parol hash qilinadi
    ============================================================ */
    async createStudent(dto: CreateStudentDto) {
      // Telefon raqami unikalligi


      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          password: "",
          role: 'STUDENT',
          isEnabled: dto.isEnabled ?? true,
          studentProfile: {
            create: {},        // StudentProfile avtomatik yaratiladi
          },
        },
        include: {
          studentProfile: true,
        },
      });

      const { password, ...result } = user;
      return result;
    }

    /* ============================================================
      UPDATE STUDENT
    ============================================================ */
    async updateStudent(studentProfileId: string, dto: UpdateStudentDto) {
      const profile = await this.findProfileOrFail(studentProfileId);

      // Telefon o'zgarsa — unikalligi tekshirish
      if (dto.phone) {
        const conflict = await this.prisma.user.findFirst({
          where: {
            phone: dto.phone,
            NOT: { id: profile.userId },
          },
        });
        if (conflict) {
          throw new ConflictException('Bu telefon raqam boshqa foydalanuvchida mavjud');
        }
      }

      const updateData: Prisma.UserUpdateInput = {};
      if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
      if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
      if (dto.phone !== undefined) updateData.phone = dto.phone;
      if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;


      const updated = await this.prisma.user.update({
        where: { id: profile.userId },
        data: updateData,
        include: {
          studentProfile: {
            include: {
              groups: {
                include: {
                  group: { include: { subject: true } },
                },
              },
            },
          },
        },
      });

      const { password, ...result } = updated;
      return result;
    }

    /* ============================================================
      DELETE STUDENT (User cascade bilan o'chadi)
    ============================================================ */
    async deleteStudent(studentProfileId: string) {
      const profile = await this.findProfileOrFail(studentProfileId);

      await this.prisma.user.delete({ where: { id: profile.userId } });

      return {
        message: 'Talaba muvaffaqiyatli o\'chirildi',
        studentProfileId,
      };
    }

    /* ============================================================
      GET ONE STUDENT
    ============================================================ */
    async getStudentById(studentProfileId: string) {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { id: studentProfileId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              isEnabled: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          groups: {
            include: {
              group: {
                include: {
                  subject: { select: { id: true, name: true, price: true } },
                  teacher: {
                    include: {
                      user: { select: { firstName: true, lastName: true, phone: true } },
                    },
                  },
                },
              },
            },
          },
          payments: {
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            take: 5,
            select: {
              id: true,
              amount: true,
              month: true,
              year: true,
              status: true,
              paidAt: true,
            },
          },
        },
      });

      if (!profile) throw new NotFoundException('Talaba topilmadi');
      return profile;
    }

    /* ============================================================
      GET ALL STUDENTS (Pagination + Search)
      - firstName, lastName, phone bo'yicha qidirish
      - groupId bo'yicha filter
      - isEnabled bo'yicha filter
    ============================================================ */
    async getAllStudents(query: StudentQueryDto) {
      const { firstName, lastName, phone, groupId, isEnabled, page, limit } = query;

      const where: Prisma.StudentProfileWhereInput = {};

      // Ism, familiya, telefon bo'yicha qidirish
      if (firstName || lastName || phone || isEnabled !== undefined) {
        where.user = {};
        if (firstName) {
          where.user.firstName = { contains: firstName, mode: 'insensitive' };
        }
        if (lastName) {
          where.user.lastName = { contains: lastName, mode: 'insensitive' };
        }
        if (phone) {
          where.user.phone = { contains: phone };
        }
        if (isEnabled !== undefined) {
          where.user.isEnabled = isEnabled;
        }
      }

      // Guruh bo'yicha filter
      if (groupId) {
        where.groups = { some: { groupId } };
      }

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.studentProfile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { user: { createdAt: 'desc' } },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isEnabled: true,
                createdAt: true,
              },
            },
            groups: {
              include: {
                group: {
                  select: {
                    id: true,
                    name: true,
                    isActive: true,
                    subject: { select: { name: true } },
                  },
                },
              },
            },
          },
        }),
        this.prisma.studentProfile.count({ where }),
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
      ADD STUDENT TO GROUP
    ============================================================ */
    async addToGroup(studentProfileId: string, dto: AddStudentToGroupDto) {
      await this.findProfileOrFail(studentProfileId);

      const group = await this.prisma.group.findUnique({
        where: { id: dto.groupId },
      });
      if (!group) throw new NotFoundException('Guruh topilmadi');

      const existing = await this.prisma.groupStudent.findUnique({
        where: {
          groupId_studentProfileId: {
            groupId: dto.groupId,
            studentProfileId,
          },
        },
      });
      if (existing) {
        throw new ConflictException('Talaba bu guruhda allaqachon mavjud');
      }

      return this.prisma.groupStudent.create({
        data: { groupId: dto.groupId, studentProfileId },
        include: {
          group: { include: { subject: true } },
          studentProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      });
    }

    /* ============================================================
      REMOVE STUDENT FROM GROUP
    ============================================================ */
    async removeFromGroup(studentProfileId: string, dto: RemoveStudentFromGroupDto) {
      await this.findProfileOrFail(studentProfileId);

      const membership = await this.prisma.groupStudent.findUnique({
        where: {
          groupId_studentProfileId: {
            groupId: dto.groupId,
            studentProfileId,
          },
        },
      });
      if (!membership) {
        throw new NotFoundException('Talaba bu guruhda topilmadi');
      }

      await this.prisma.groupStudent.delete({
        where: {
          groupId_studentProfileId: {
            groupId: dto.groupId,
            studentProfileId,
          },
        },
      });

      return { message: 'Talaba guruhdan chiqarildi', studentProfileId, groupId: dto.groupId };
    }

    /* ============================================================
      TOGGLE isEnabled (Akkaunt bloklash / ochish)
    ============================================================ */
    async toggleStatus(studentProfileId: string) {
      const profile = await this.findProfileOrFail(studentProfileId);

      const user = await this.prisma.user.findUnique({ where: { id: profile.userId } });
      const updated = await this.prisma.user.update({
        where: { id: profile.userId },
        data: { isEnabled: !user!.isEnabled },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          isEnabled: true,
        },
      });

      return {
        message: updated.isEnabled ? 'Akkaunt faollashtirildi' : 'Akkaunt bloklandi',
        ...updated,
      };
    }

    /* ============================================================
      PRIVATE HELPER
    ============================================================ */
    private async findProfileOrFail(studentProfileId: string) {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { id: studentProfileId },
      });
      if (!profile) throw new NotFoundException('Talaba profili topilmadi');
      return profile;
    }
  }