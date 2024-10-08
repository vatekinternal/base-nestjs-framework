// auth/auth.controller.ts
import { Body, Controller, Get, Headers, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { toApiErrorResp, toApiOkResp } from 'src/common/api';
import { AppError, CustomRequest } from 'src/common/types';
import { User } from 'src/schema/user.schema';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from './public.decorator';
import { ErrorMessage } from 'src/common/error-message';

@ApiTags('default')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Headers('x-device-id') deviceId: string,
  ) {
    const userOrError = await this.usersService.findOne({ username: loginDto.username });
    if (userOrError.isErr() || !userOrError.value) {
      return res.status(401).json({ message: ErrorMessage.LOGIN_FAILED });
    }

    const user = userOrError.value;
    const validatedOrError = await this.authService.validateUser(user, loginDto.password);
    const genTokenOrError = validatedOrError.andThen((u: User) =>
      this.authService.login(u, deviceId),
    );

    return genTokenOrError.match(
      (v) => {
        return res.status(200).json(v);
      },
      (error: AppError) => {
        console.error({ error });
        return res.status(401).json({ message: error.message });
      },
    );
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Body() refreshDto: RefreshDto,
    @Res() res: Response,
    @Headers('x-device-id') deviceId: string,
  ) {
    const refreshDataOrError = await this.authService.refresh(refreshDto, deviceId);

    return refreshDataOrError.match(
      (v) => {
        return res.status(200).json(v);
      },
      (error: AppError) => {
        // console.error({ error });
        return res.status(401).json({ message: ErrorMessage.UNAUTHORIZED });
      },
    );
  }

  @ApiBearerAuth()
  @Post('logout')
  async logout(@Req() req: CustomRequest, @Res() res: Response) {
    const logoutDataOrError = await this.authService.logout({ _id: req.user.userId });
    return logoutDataOrError.match(
      (v) => {
        return res.status(200).json(v);
      },
      (error: AppError) => {
        // console.error({ error });
        return res.status(401).json({ message: ErrorMessage.UNAUTHORIZED });
      },
    );
  }

  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@Req() req: CustomRequest, @Res() res: Response) {
    const userOrError = await this.usersService.findOne({ _id: req.user.userId }, [], {
      password: 0,
    });
    return userOrError.match(
      (user: User) => res.status(200).json(toApiOkResp(user)),
      (e: AppError) => res.status(500).json(toApiErrorResp(e)),
    );
  }
}
