import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from 'src/common/types';
import { UsersService } from 'src/users/users.service';
import { jwtConstants } from './constants';
import { IS_PUBLIC_KEY } from './public.decorator';
import { IS_ADMIN_KEY } from './admin.decorator';
import { Role } from 'src/schema/user.schema';
import { ErrorMessage } from 'src/common/error-message';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtConstants.secret,
      });
      const deviceId = this.extractDeviceFromHeader(request);
      if (deviceId !== payload.deviceId) {
        throw new UnauthorizedException(ErrorMessage.ACCOUNT_HAS_BEEN_LOGIN);
      }
      const userOrError = await this.usersService.findOne({
        _id: payload.userId,
        deviceId: payload.deviceId,
      });
      if (userOrError.isErr() || !userOrError.value) {
        throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);
      }
      // const user = userOrError.value;

      const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isAdmin) {
        if (payload.role !== Role.Admin) {
          throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);
        }
      }

      request['user'] = payload;
      return true;
    } catch (e) {
      // console.error(e);
      throw new UnauthorizedException(e?.message || ErrorMessage.UNAUTHORIZED);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractDeviceFromHeader(request: Request): string | undefined {
    const deviceId = request.headers['x-device-id'] as string;
    return deviceId;
  }
}
