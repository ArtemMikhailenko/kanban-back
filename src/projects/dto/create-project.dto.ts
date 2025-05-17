// src/projects/dto/create-project.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'Назва проекту має бути строкою' })
  @IsNotEmpty({ message: 'Назва проекту обов\'язкова' })
  name: string;

  @IsString({ message: 'Опис проекту має бути строкою' })
  @IsOptional()
  description?: string;
}