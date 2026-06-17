import { Module } from '@nestjs/common';
import { SciensService } from './sciens.service';
import { SciensController } from './sciens.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports:[JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      secret: config.get<string>('Jwt_Acc'),
      signOptions: { 
        expiresIn: "20m", 
      },
    }),
  })],
  controllers: [SciensController],
  providers: [SciensService],
})
export class SciensModule {}
