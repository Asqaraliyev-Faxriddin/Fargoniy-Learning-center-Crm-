import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.controller';
import {
  CreateSubjectDto,
  DeleteSubjectDto,
  FindAllSubjectDto,
  FindOneSubjectDto,
  UpdateSubjectDto,
} from './dto/create-scien.dto';

@Injectable()
export class SciensService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: createSubjectDto,
    });
  }

  async findAll(query: FindAllSubjectDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: any = {};

    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      };
    }

    // ✅ Boolean to'g'ri tekshiriladi (string emas)
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.subject.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne({ id }: FindOneSubjectDto) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    // ✅ Topilmasa xato qaytaradi
    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }

    return subject;
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto) {
    // ✅ Avval mavjudligini tekshiradi
    await this.findOne({ id });

    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
    });
  }

  async remove({ id }: DeleteSubjectDto) {
    // ✅ Avval mavjudligini tekshiradi
    await this.findOne({ id });

    return this.prisma.subject.delete({
      where: { id },
    });
  }
}