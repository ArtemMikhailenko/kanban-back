// src/users/schemas/user.schema.ts (оновлена схема)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationToken?: string; // Додаємо опційність для TypeScript

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  lastLogin: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);