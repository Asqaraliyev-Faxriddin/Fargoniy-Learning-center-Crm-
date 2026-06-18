import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/core/prisma/prisma.controller';
import { UserRole } from '@prisma/client';

@Injectable()
export class SeaderService implements OnModuleInit {
  private readonly logger = new Logger(SeaderService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.CreateUsers()
  }

  async CreateUsers() {
    const password = await bcrypt.hash('sultonbek001', 10);

    const pass = await bcrypt.hash("s11111",10)
















    const usersData = [
      {
        firstName: 'Faxriddin',
        lastName: 'Asqaraliyev',
        email: 'asqaraliyevfaxriddin@gmail.com',
        phone: '+998901234567',
        role: UserRole.DIREKTOR,
        password,
      },
      {
        firstName: 'Sultonbek',
        lastName: `G'ulomov`,
        email: 'sultonbek@gmail.com',
        phone: '+998901234567',
        role: UserRole.DIREKTOR,
        password,
      },
      {
        firstName: 'Sultonbek',
        lastName: `G'ulomov`,
        email: 'sultonbekov@gmail.com',
        phone: '+998901234567',
        role: UserRole.DIREKTOR,
        password,
      },
      {
        firstName: 'Saidraxim',
        lastName: `Murodilov`,
        email: 'saidraxim@gmail.com',
        phone: '+998901234567',
        role: UserRole.DIREKTOR,
        password:pass,
      },
      
    ];

    this.logger.log('🌱 Seeding jarayoni boshlandi...');

    await this.prisma.user.createMany({
      data: usersData,
      skipDuplicates: true,
    });

    const dbUsers = await this.prisma.user.findMany({
      where: { email: { in: usersData.map((u) => u.email) } },
    });

    for (const user of dbUsers) {
      if (user.role === UserRole.STUDENT) {
        const existingStudent = await this.prisma.studentProfile.findUnique({
          where: { userId: user.id },
        });

        if (!existingStudent) {
          await this.prisma.studentProfile.create({
            data: { userId: user.id },
          });
          this.logger.log(`🎓 StudentProfile yaratildi: ${user.firstName}`);
        }
      } 
      
      else if (user.role === UserRole.TEACHER) {
        const existingTeacher = await this.prisma.teacherProfile.findUnique({
          where: { userId: user.id },
        });

        if (!existingTeacher) {
          await this.prisma.teacherProfile.create({
            data: { 
              userId: user.id,
              salary: 5000000
            },
          });
          this.logger.log(`👨‍🏫 TeacherProfile yaratildi: ${user.firstName}`);
        }
      }
    }

    this.logger.log('✅ Seeding jarayoni muvaffaqiyatli yakunlandi. DIREKTOR, ADMIN, TEACHER va STUDENT profillari bilan yaratildi.');
  }
}