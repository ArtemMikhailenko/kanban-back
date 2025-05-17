// src/auth/auth.controller.ts
import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Get,
    Param,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { CreateUserDto } from '../users/dto/create-user.dto';
  import { LoginDto } from './dto/login.dto';
  import { LocalAuthGuard } from './guards/local-auth.guard';
  import { JwtAuthGuard } from './guards/jwt-auth.guard';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
      return this.authService.register(createUserDto);
    }
  
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req, @Body() loginDto: LoginDto) {
      return this.authService.login(req.user, loginDto);
    }
  
    @Post('resend-verification')
    async resendVerification(@Body('email') email: string) {
      return this.authService.resendVerificationEmail(email);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
      return {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        avatarUrl: req.user.avatarUrl,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin,
      };
    }
  }