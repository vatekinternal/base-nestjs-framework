import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Role } from 'src/schema/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OnStartAppService implements OnApplicationBootstrap {
  constructor(private readonly userService: UsersService) {}

  async onApplicationBootstrap() {
    try {
      console.log('\nStarted app, init original data!!!\n');

      const firstAdminOrError = await this.userService.findOne({ username: 'admin' });
      if (firstAdminOrError.isErr()) {
        const e = firstAdminOrError.error;
        console.error(e);
        return;
      }
      if (!firstAdminOrError.value) {
        const createOrError = await this.userService.create({
          role: Role.Admin,
          permissions: [],
          accountName: 'admin',
          username: 'admin',
          password: 'password123',
          phone: '0363011503',
          isActive: true,
          description: 'First admin',
        });

        if (createOrError.isErr()) {
          console.error(createOrError.error);
        }
      }

      console.log('\nFinished init original data!!!\n');
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }
}
