// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email має бути валідною адресою' })
  @IsNotEmpty({ message: 'Email обов\'язковий' })
  email: string;

  @IsString({ message: 'Пароль має бути строкою' })
  @IsNotEmpty({ message: 'Пароль обов\'язковий' })
  password: string;

  @IsNotEmpty()
  rememberMe?: boolean;
}