// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  dotenv.config();
  
  const app = await NestFactory.create(AppModule);
  
  // Налаштування CORS для роботи з фронтендом
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Налаштування захисту
  app.use(helmet());
  app.use(cookieParser());
  
  // Глобальні пайпи для валідації
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Глобальний префікс API
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 5005;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();