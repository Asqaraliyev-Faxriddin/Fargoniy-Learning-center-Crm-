import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { SeaderModule } from './core/seader/seader.module';
import { StudentsModule } from './module/students/students.module';
import { GroupsModule } from './module/groups/groups.module';
import { SciensModule } from './module/sciens/sciens.module';
import { TeachersModule } from './module/teachers/teachers.module';
import { ExpencesModule } from './module/expences/expences.module';
import { AdminModule } from './module/admin/admin.module';
import { TeacherPriceModule } from './module/teacher-price/teacher-price.module';
import { PaymentsModule } from './module/payments/payments.module';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    PrismaModule,
    AuthModule,
    SeaderModule,
    StudentsModule,
    GroupsModule,
    SciensModule,
    TeachersModule,
    ExpencesModule,
    AdminModule,
    TeacherPriceModule,
    PaymentsModule,
  ],

})
export class AppModule {}
