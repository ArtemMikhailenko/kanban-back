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

  // CORS
  app.enableCors({
    origin: true,               // вместо конкретного URL или '*' 
    credentials: true,          // если вам нужны куки/авторизация
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // Validation
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

  // Global API prefix
  app.setGlobalPrefix('api');

  // Порт из окружения + 3000 по умолчанию
  const port = parseInt(process.env.PORT as string, 10) || 5000;
  // Слушаем на "0.0.0.0" — важно для облачных окружений
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on http://0.0.0.0:${port}`);
}

bootstrap();
