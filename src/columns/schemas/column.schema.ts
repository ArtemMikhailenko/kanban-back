// src/columns/schemas/column.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Project } from '../../projects/schemas/project.schema';

@Schema({ timestamps: true })
export class Column {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Project;

  @Prop({ type: [String], default: [] })
  taskIds: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export type ColumnDocument = Column & Document;
export const ColumnSchema = SchemaFactory.createForClass(Column);