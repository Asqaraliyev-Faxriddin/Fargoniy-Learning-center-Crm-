import { Module } from '@nestjs/common';
import { StudentService } from './students.service';
import { StudentController } from './students.controller';
import { AuthGuard } from 'src/common/guards/AuthGuard';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[   
    JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      secret: config.get<string>('Jwt_Acc'),
      signOptions: { 
        expiresIn: "20m", 
      },
    }),

  })


],
  controllers: [StudentController],
  providers: [StudentService,AuthGuard],
})
export class StudentsModule {}
