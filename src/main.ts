import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config();
  console.info({
    PORT: process.env.PORT,
    MONGODB_HOST: process.env.MONGODB_HOST,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
    MONGODB_USERNAME: process.env.MONGODB_USERNAME,
    MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
  });

  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug'] });
  app.setGlobalPrefix('/api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('swagger API')
    .setDescription('The swagger API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // const adminConfig: ServiceAccount = {
  //   projectId: process.env.FIREBASE_PROJECT_ID,
  //   privateKey: process.env.FIREBASE_PRIVATE_KEY,
  //   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // };

  // admin.initializeApp({
  //   credential: admin.credential.cert(adminConfig as ServiceAccount),
  //   databaseURL: process.env.FIREBASE_DATABASE_URL,
  // });
  await app.listen(process.env?.PORT);
}

bootstrap();
