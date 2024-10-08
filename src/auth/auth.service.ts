import { RefreshDto } from './dto/refresh.dto';
// auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// import { getDatabase } from 'firebase-admin/database';
import { Result, err, ok } from 'neverthrow';
import { AppError, JwtPayload } from 'src/common/types';
import { User } from 'src/schema/user.schema';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';
import { ErrorMessage } from 'src/common/error-message';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(user: User, password: string): Promise<Result<User, AppError>> {
    if (!user) {
      return err({
        message: ErrorMessage.USER_NOT_FOUND,
        statusCode: 404,
      });
    }
    if (!user.isActive) {
      return err({
        message: ErrorMessage.ACCOUNT_HAS_BEEN_LOCKED,
        statusCode: 401,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return ok(user);
    } else {
      return err({
        message: ErrorMessage.INVALID_PASSWORD,
        statusCode: 401,
      });
    }
  }

  async refresh(
    refreshDto: RefreshDto,
    deviceId: string,
  ): Promise<Result<Record<string, any>, AppError>> {
    try {
      const jwtPayload = this.jwtService.verify<JwtPayload>(refreshDto.refresh_token, {
        secret: jwtConstants.refresh_secret,
      });
      if (deviceId !== jwtPayload.deviceId) {
        return err({
          message: ErrorMessage.UNAUTHORIZED,
          statusCode: 401,
        });
      }
      const userOrError = await this.usersService.findOne({ _id: jwtPayload.userId, deviceId });
      if (userOrError.isOk()) {
        const userData = userOrError.value;
        if (!userData) {
          return err({
            message: ErrorMessage.UNAUTHORIZED,
            statusCode: 401,
          });
        }
        return this.login(userData, deviceId);
      }
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_PROCESSING_REFRESH_TOKEN,
        statusCode: 401,
        context: refreshDto,
      });
    }
  }

  login(user: User, deviceId: string): Result<Record<string, any>, AppError> {
    try {
      const payload: JwtPayload = {
        userId: user._id.toString(),
        role: user.role,
        deviceId,
      };
      const access_token = this.jwtService.sign(payload, { secret: jwtConstants.secret });
      const refresh_token = this.jwtService.sign(payload, {
        secret: jwtConstants.refresh_secret,
        expiresIn: '2d',
      });
      if (user.deviceId && user.deviceId !== deviceId) {
        return err({
          message: ErrorMessage.ACCOUNT_HAS_BEEN_LOGIN,
          statusCode: 401,
        });
      }

      this.usersService.updateDevice(user._id as string, deviceId);
      this.usersService.updateRequestTime(user._id as string, new Date());

      return ok({
        access_token: access_token,
        refresh_token: refresh_token,
        username: user.username,
      });
    } catch (e) {
      // console.error(e);
      return err({
        message: ErrorMessage.ERROR_WHEN_GENERATING_TOKEN,
        cause: e,
      });
    }
  }

  async logout({ _id: userId }: { _id: string }) {
    try {
      return ok({
        message: ErrorMessage.LOGOUT_SUCCESSFULLY,
      });
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_LOGOUT,
        cause: e,
      });
    }
  }
}
