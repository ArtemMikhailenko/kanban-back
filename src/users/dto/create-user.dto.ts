// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email має бути валідною адресою' })
  @IsNotEmpty({ message: 'Email обов\'язковий' })
  email: string;

  @IsString({ message: 'Пароль має бути строкою' })
  @IsNotEmpty({ message: 'Пароль обов\'язковий' })
  @MinLength(8, { message: 'Пароль має містити мінімум 8 символів' })
  password: string;

  @IsString({ message: 'Ім\'я має бути строкою' })
  @IsNotEmpty({ message: 'Ім\'я обов\'язкове' })
  fullName: string;
}