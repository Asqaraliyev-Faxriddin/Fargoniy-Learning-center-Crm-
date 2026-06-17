// groups.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.controller';
import { CreateGroupDto, FindAllGroupDto, FindAllTeacherDto, UpdateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(private  prisma: PrismaService) {}

  // ─── CREATE ─────────────────────────────────────────────
  async create(dto: CreateGroupDto) {

    let {teacherId,subjectId} = dto

    let oldsubject = await this.prisma.subject.findFirst({
      where:{
        id:subjectId
      }
    })

    let oldteacher = await this.prisma.teacherProfile.findFirst({
      where:{
        id:teacherId,
      }
    })

    if (!oldsubject || !oldteacher) {
      throw new NotFoundException(
        !oldsubject ? 'Subject not found' : 'Teacher not found',
      );
    }

    return this.prisma.group.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
      },
      include: {
        subject: true,
        teacher: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
    });
  }

  async findAll(query: FindAllTeacherDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
  
    const where: any = {
      role: 'TEACHER',
      ...(query.isEnabled !== undefined && { isEnabled: query.isEnabled }),
      ...(query.name && {
        OR: [
          { firstName: { contains: query.name, mode: 'insensitive' } },
          { lastName: { contains: query.name, mode: 'insensitive' } },
        ],
      }),
      ...(query.subjectId && {
        teacherProfile: {
          groups: {
            some: { subjectId: query.subjectId },
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
              salary: true,
              groups: {
                select: {
                  id: true,
                  name: true,
                  room: true,
                  isActive: true,
                  days:true,
                  startDate: true,
                  startTime:true,
                  endTime:true,
                  // ✅ Fan ma'lumotlari
                  subject: {
                    select: { id: true, name: true, price: true },
                  },
                  // ✅ O'quvchilar soni
                  _count: {
                    select: { students: true },
                  },
                },
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
      phone: user.phone,
      isEnabled: user.isEnabled,
      createdAt: user.createdAt,
      
      teacherProfileId: user.teacherProfile?.id,
      salary: user.teacherProfile?.salary,
      groupsCount: user.teacherProfile?.groups.length ?? 0,
      studentsCount:
        user.teacherProfile?.groups.reduce(
          (sum, group) => sum + group._count.students,
          0,
        ) ?? 0,
      // ✅ Guruhlar to'liq ma'lumot bilan
      groups: user.teacherProfile?.groups.map((group) => ({
        id: group.id,
        name: group.name,
        room: group.room,
        isActive: group.isActive,
        startDate: group.startDate,
        startTime:group.startTime,
        endTime:group.endTime,
        days:group.days,
        subject: group.subject,
        studentsCount: group._count.students,
      })) ?? [],
    }));
  
    return { data: formatted, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── FIND ONE ───────────────────────────────────────────
 
  // ─── FIND ONE ───────────────────────────────────────────
  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        
        subject: {
          select: { id: true, name: true, price: true },
        },
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        // O'quvchilar ro'yxati
        students: {
          include: {
            studentProfile: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true, phone: true } },
              },
            },
          },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found`);
    }

    return {
      id: group.id,
      name: group.name,
      room: group.room,
      isActive: group.isActive,
      startDate: group.startDate,
      createdAt: group.createdAt,
      days: group.days,     
      startTime:group.startTime,
      endTime:group.endTime,
      subject: group.subject,
      teacher: {
        id: group.teacher.id,
        firstName: group.teacher.user.firstName,
        lastName: group.teacher.user.lastName,
        email: group.teacher.user.email,
        phone: group.teacher.user.phone,
      },
      studentsCount: group._count.students,
      students: group.students.map((gs) => ({
        groupStudentId: gs.id,
        joinedAt: gs.joinedAt,
        studentProfileId: gs.studentProfileId,
        firstName: gs.studentProfile.user.firstName,
        lastName: gs.studentProfile.user.lastName,
        email: gs.studentProfile.user.email,
        phone: gs.studentProfile.user.phone,
      })),
    };
  }

  // ─── UPDATE ─────────────────────────────────────────────
  async update(id: string, dto: UpdateGroupDto) {
    await this.findOne(id);

    return this.prisma.group.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
      },
      include: {
        subject: { select: { id: true, name: true, price: true } },
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
  
    await this.prisma.payment.deleteMany({
      where: { groupId: id },
    });
  
    return this.prisma.group.delete({
      where: { id },
    });
  }
}