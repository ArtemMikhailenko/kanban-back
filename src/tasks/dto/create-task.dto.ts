// src/tasks/dto/create-task.dto.ts
import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTaskDto {
  @IsString({ message: 'Назва задачі має бути строкою' })
  @IsNotEmpty({ message: 'Назва задачі обов\'язкова' })
  title: string;

  @IsString({ message: 'Опис задачі має бути строкою' })
  @IsOptional()
  description?: string;

  @IsMongoId({ message: 'Невірний формат ID колонки' })
  @IsNotEmpty({ message: 'ID колонки обов\'язковий' })
  columnId: Types.ObjectId;

  @IsMongoId({ message: 'Невірний формат ID проекту' })
  @IsNotEmpty({ message: 'ID проекту обов\'язковий' })
  projectId: Types.ObjectId;

  @IsDateString({}, { message: 'Дедлайн має бути валідною датою' })
  @IsOptional()
  deadline?: string;

  @IsArray({ message: 'Мітки мають бути масивом' })
  @IsString({ each: true, message: 'Кожна мітка має бути строкою' })
  @IsOptional()
  labels?: string[];
}