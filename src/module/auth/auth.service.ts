import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAccesToken, JwtRefreshToken } from "src/common/config/config.service" 
import { Token_activate } from "src/common/config/token";
import { PrismaService } from "src/core/prisma/prisma.controller";
import {  LoginDto } from "./dto/create-auth.dto";
import * as bcrypt from "bcrypt";
import { RefreshTokenDto } from "./dto/refresh.token.dto";

import { Request } from "express";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtServise: JwtService,
  ) {}

  async generateToken(payload: Token_activate, onlyAccess = false) {
    const AccessToken = await this.jwtServise.signAsync(payload, JwtAccesToken);
    const RefreshToken = await this.jwtServise.signAsync(payload, JwtRefreshToken);

    if (onlyAccess) {
      return {AccessToken};
    } else {
      return {
        AccessToken,
        RefreshToken,
      };
    }
  }



  async login(payload: LoginDto, req: Request) {
    const user = await this.PhoneAndPasswordCheck(payload.password, payload.email);


    const tokens = await this.generateToken({ id: user.id, role: user.role });

    return {
      status: true,
      message: "Login successful",
      tokens,
    };
  }

  async RefresholdAcces(token: RefreshTokenDto) {
    try {
      const oldId = await this.jwtServise.verifyAsync(token.token, JwtRefreshToken);
      
      if (!oldId) throw new UnauthorizedException();
      
      const checkUser = await this.prisma.user.findFirst({ where: { id: oldId.id } });
      if (!checkUser) throw new UnauthorizedException();
      
      const AccessToken = await this.generateToken(
        { id: checkUser.id, role: checkUser.role },
        true
      );
      
      return { AccessToken };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
  



  

  async PhoneAndPasswordCheck(password: string, email: string) {
    const oldUser = await this.prisma.user.findUnique({ where: { email } });

    if (!oldUser) throw new NotFoundException("Password Incorrect or Email not found");

    let checkPassword: boolean;
    if (oldUser.password.startsWith("$2b$")) {
      checkPassword = await bcrypt.compare(password, oldUser.password);
    } else {
      checkPassword = password === oldUser.password;
    }

    if (!checkPassword) {
      throw new BadRequestException("Password Incorrect or Email not found");
    }

    return oldUser;
  }

  


  




  
}
