import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

import { MongooseError } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OnStartAppModule } from './on-start-app/on-start-app.module';

dotenv.config();
const DB_URI = `mongodb://${process.env?.MONGODB_HOST}/${process.env?.MONGODB_DB_NAME}`;

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'files'),
    }),
    MongooseModule.forRoot(DB_URI, {
      retryAttempts: 1,
      retryDelay: 1000,
      connectionErrorFactory: (error: MongooseError) => {
        console.error(error);
        return error;
      },
      maxPoolSize: 10,
      minPoolSize: 0,
      connectTimeoutMS: 30000,
      maxIdleTimeMS: 10000,
      socketTimeoutMS: 30000,
    }),
    AuthModule,
    UsersModule,
    OnStartAppModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
