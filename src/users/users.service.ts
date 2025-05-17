// src/users/users.service.ts (додавання методу regenerateVerificationToken)
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Перевіряємо, чи вже існує користувач з таким email
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      throw new ConflictException('Користувач з таким email вже існує');
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Створення токену верифікації
    const verificationToken = uuidv4();

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    });

    return newUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`Користувача з email ${email} не знайдено`);
    }
    return user;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Користувача з ID ${id} не знайдено`);
    }
    return user;
  }

  async verifyEmail(token: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ verificationToken: token }).exec();
    if (!user) {
      throw new NotFoundException('Недійсний або закінчений термін дії токену підтвердження');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    return user.save();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() }).exec();
  }

  /**
   * Генерує новий токен підтвердження для користувача
   * @param userId ID користувача
   * @returns Оновлений документ користувача
   */
  async regenerateVerificationToken(userId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    
    // Створюємо новий токен верифікації
    const verificationToken = uuidv4();
    
    // Оновлюємо користувача з новим токеном
    user.verificationToken = verificationToken;
    
    return user.save();
  }
}