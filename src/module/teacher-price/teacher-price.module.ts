import { Module } from '@nestjs/common';
import { TeacherSalaryService } from './teacher-price.service';
import { TeacherSalaryController } from './teacher-price.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/common/guards/AuthGuard';

@Module({
  imports:[ JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      secret: config.get<string>('Jwt_Acc'),
      signOptions: { 
        expiresIn: "20m", 
      },
    }),

  })
],
  controllers: [TeacherSalaryController],
  providers: [TeacherSalaryService,AuthGuard],
})
export class TeacherPriceModule {}
