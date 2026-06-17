// teachers.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.controller';
import { CreateTeacherDto, FindAllTeacherDto, UpdateTeacherDto } from './dto/create-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── CREATE ─────────────────────────────────────────────
  async create(dto: CreateTeacherDto) {
    // Email band emasligini tekshirish

    const clear = (dto.phone || '').replace(/\s+/g, '');

    let olduser= await this.prisma.user.findFirst({
      where:{
        phone:clear,role:"TEACHER"
      }
    })

    if(olduser){
      throw new ConflictException("Bu teacher avval ro'yxatdan o'tgan")
    }

    console.log(clear);
    
    // User + TeacherProfile birgalikda yaratiladi
    return this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: "",
        phone: clear,
        role: 'TEACHER',
        teacherProfile: {
          create: {
            percent: dto.percent || 0 ,
          },
        },
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
        teacherProfile: {
          select: {
            id: true,
            salary: true,
          },
        },
      },
    });
  }

  // ─── FIND ALL ───────────────────────────────────────────
  async findAll(query: FindAllTeacherDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: any = {
      role: 'TEACHER',
      // isEnabled filter
      ...(query.isEnabled !== undefined && { isEnabled: query.isEnabled }),
      // ism yoki familiya bo'yicha qidirish
      ...(query.name && {
        OR: [
          { firstName: { contains: query.name, mode: 'insensitive' } },
          { lastName: { contains: query.name, mode: 'insensitive' } },
        ],
      }),
      // Fan IDsi bo'yicha — shu fanni o'qitadigan ustoz
      ...(query.subjectId && {
        teacherProfile: {
          groups: {
            some: {
              subjectId: query.subjectId,
            },
          },
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isEnabled: true,
          createdAt: true,
          teacherProfile: {
            select: {
              id: true,
              percent: true,

              // Nechta guruh boshqarishi
              _count: {
                select: { groups: true },
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const formatted = data.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ,
      isEnabled: user.isEnabled,
      createdAt: user.createdAt,
      teacherProfileId: user.teacherProfile?.id,
      percent: user.teacherProfile?.percent,
      groupsCount: user.teacherProfile?._count?.groups ?? 0,
    }));

    return { data: formatted, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── FIND ONE ───────────────────────────────────────────
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isEnabled: true,
        createdAt: true,
        teacherProfile: {
          select: {
            id: true,
            salary: true,
            groups: {
              select: {
                id: true,
                name: true,
                room: true,
                isActive: true,
                startDate: true,
                subject: { select: { id: true, name: true, price: true } },
                _count: { select: { students: true } },
              },
            },
          },
        },
      },
    });

    if (!user || user.teacherProfile === null) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isEnabled: user.isEnabled,
      createdAt: user.createdAt,
      teacherProfileId: user.teacherProfile.id,
      salary: user.teacherProfile.salary,
      groups: user.teacherProfile.groups.map((g) => ({
        id: g.id,
        name: g.name,
        room: g.room,
        isActive: g.isActive,
        startDate: g.startDate,
        subject: g.subject,
        studentsCount: g._count.students,
      })),
    };
  }

  // ─── UPDATE ─────────────────────────────────────────────
  async update(id: string, dto: UpdateTeacherDto) {
    await this.findOne(id);
  
    const { percent, ...userFields } = dto;
  
    return this.prisma.user.update({
      where: { id },
      data: {
        ...userFields,
  
        ...(percent !== undefined && {
          teacherProfile: {
            update: {
              percent,
            },
          },
        }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isEnabled: true,
        teacherProfile: {
          select: {
            id: true,
            salary: true,
          }, 
        },
      },
    });
  }

  // ─── REMOVE ─────────────────────────────────────────────
  async remove(id: string) {
    console.log("s");
    
    await this.findOne(id);

    let teacherp = await this.prisma.teacherProfile.findFirst({
      where:{
        userId:id
      }
    })

    let top = await this.prisma.group.findFirst({
      where:{
        teacherId:teacherp?.id
      }
    })

    if(top){
      throw new BadRequestException("Bu ustozni avval dars o'tayotgan guruhlaridan chiqaring.")
    }

    // User o'chirilsa TeacherProfile ham cascade bilan o'chadi
    return this.prisma.user.delete({ where: { id } });
  }
}