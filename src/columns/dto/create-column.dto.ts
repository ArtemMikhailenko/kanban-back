// src/columns/dto/create-column.dto.ts
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateColumnDto {
  @IsString({ message: 'Назва колонки має бути строкою' })
  @IsNotEmpty({ message: 'Назва колонки обов\'язкова' })
  title: string;

  @IsMongoId({ message: 'Невірний формат ID проекту' })
  @IsNotEmpty({ message: 'ID проекту обов\'язковий' })
  projectId: Types.ObjectId;
}