import { Module } from '@nestjs/common';
import { PaymentService } from './payments.service';
import { PaymentController } from './payments.controller';
import { AuthGuard } from 'src/common/guards/AuthGuard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports:[  JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      secret: config.get<string>('Jwt_Acc'),
      signOptions: { 
        expiresIn: "20m", 
      },
    }),
  })],
  controllers: [PaymentController],
  providers: [PaymentService,AuthGuard],
})
export class PaymentsModule {}
