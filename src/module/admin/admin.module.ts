import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
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
  controllers: [AdminController],
  providers: [AdminService,AuthGuard],
})
export class AdminModule {}
