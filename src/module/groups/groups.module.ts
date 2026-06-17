import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
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
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
