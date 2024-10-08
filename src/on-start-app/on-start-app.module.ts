import { Module } from '@nestjs/common';
import { OnStartAppService } from './on-start-app.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [OnStartAppService],
})
export class OnStartAppModule {}
