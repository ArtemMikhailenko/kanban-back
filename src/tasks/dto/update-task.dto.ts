// src/tasks/dto/update-task.dto.ts
import { IsArray, IsDateString, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateTaskDto {
  @IsString({ message: 'Назва задачі має бути строкою' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Опис задачі має бути строкою' })
  @IsOptional()
  description?: string;

  @IsMongoId({ message: 'Невірний формат ID колонки' })
  @IsOptional()
  columnId?: Types.ObjectId;

  @IsDateString({}, { message: 'Дедлайн має бути валідною датою' })
  @IsOptional()
  deadline?: string;

  @IsArray({ message: 'Мітки мають бути масивом' })
  @IsString({ each: true, message: 'Кожна мітка має бути строкою' })
  @IsOptional()
  labels?: string[];
}