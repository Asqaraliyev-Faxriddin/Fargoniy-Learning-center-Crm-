
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    let roles = this.reflector.getAllAndOverride<UserRole[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return true;
    }

    let request = context.switchToHttp().getRequest();
    let user = request.user

    
    if(!user){
        throw new NotFoundException()
    }
     
      // @ts-ignore
     if(roles.includes(user.role )){
        return true
    }else {
        throw new ForbiddenException()
    }


  }
}