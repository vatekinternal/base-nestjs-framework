import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Check health server',
    description: 'Retrieve a greeting message.',
  })
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
