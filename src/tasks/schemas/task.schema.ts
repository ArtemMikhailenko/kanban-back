// src/tasks/schemas/task.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Column } from '../../columns/schemas/column.schema';
import { Project } from '../../projects/schemas/project.schema';

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Column', required: true })
  columnId: Column;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Project;

  @Prop()
  deadline: Date;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export type TaskDocument = Task & Document;
export const TaskSchema = SchemaFactory.createForClass(Task);