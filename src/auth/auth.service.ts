// src/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from './mail.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ message: string }> {
    try {
      const user = await this.usersService.create(createUserDto);
      
      // Перевіряємо, чи існує токен підтвердження
      if (!user.verificationToken) {
        throw new BadRequestException('Не вдалося створити токен підтвердження');
      }
      
      // Відправляємо лист для підтвердження email
      await this.mailService.sendVerificationEmail(
        user.email,
        user.verificationToken,
        user.fullName,
      );
      
      return {
        message: 'Користувач успішно зареєстрований. Перевірте вашу пошту для підтвердження email.',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Помилка при реєстрації користувача');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        const { password, ...result } = user.toObject();
        return result;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(user: UserDocument, loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
    // Оновлюємо час останнього входу
    await this.usersService.updateLastLogin(user._id);
    
    // Створюємо payload для JWT
    const payload = { email: user.email, sub: user._id };
    
    // Визначаємо час життя токена в залежності від опції "запам'ятати мене"
    const expiresIn = loginDto.rememberMe ? 
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN', '7d') : 
      this.configService.get<string>('JWT_EXPIRES_IN', '24h');
    
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn }),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      if (user.isVerified) {
        throw new BadRequestException('Email вже підтверджено');
      }
      
      // Перевіряємо, чи існує токен підтвердження
      if (!user.verificationToken) {
        // Якщо токен відсутній, створюємо новий
        const updatedUser = await this.usersService.regenerateVerificationToken(user._id);
        
        if (!updatedUser.verificationToken) {
          throw new BadRequestException('Не вдалося створити токен підтвердження');
        }
        
        // Відправляємо лист з новим токеном
        await this.mailService.sendVerificationEmail(
          updatedUser.email,
          updatedUser.verificationToken,
          updatedUser.fullName,
        );
      } else {
        // Використовуємо існуючий токен
        await this.mailService.sendVerificationEmail(
          user.email,
          user.verificationToken,
          user.fullName,
        );
      }
      
      return {
        message: 'Лист з підтвердженням надіслано повторно!',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Не вдалося відправити листа з підтвердженням');
    }
  }
}