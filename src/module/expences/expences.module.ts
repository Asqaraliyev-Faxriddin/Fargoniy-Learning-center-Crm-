import { Module } from '@nestjs/common';
import { ExpencesService } from './expences.service';
import { ExpencesController } from './expences.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/common/guards/AuthGuard';
import { RolesGuard } from 'src/common/guards/RolesGuard';

@Module({
  imports:[ JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      secret: config.get<string>('Jwt_Acc'),
      signOptions: { 
        expiresIn: "20m", 
      },
    }),


  }),],
  controllers: [ExpencesController],
  providers: [ExpencesService,AuthGuard,RolesGuard],
})
export class ExpencesModule {}
