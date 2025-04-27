import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterRequest } from './dto/user-register-request';
import { UserLoginRequest } from './dto/user-login-request';
import { UserLoginResponse } from './dto/user-login-response';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordRequest } from './dto/forgot-password-request';
import { ResetPasswordRequest } from './dto/reset-password-request';
import { LocalAuthGuard } from './guard/local-auth.guard';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: UserRegisterRequest })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: UserLoginResponse })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or user already exists' })
  async register(@Body() userRegisterRequest: UserRegisterRequest): Promise<UserLoginResponse> {
    return this.authService.register(userRegisterRequest);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: UserLoginRequest })
  @ApiResponse({ status: 200, description: 'Login successful', type: UserLoginResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid credentials' })
  async login(@Body() userLoginRequest: UserLoginRequest): Promise<UserLoginResponse> {
    return this.authService.login(userLoginRequest);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send email to user to change password' })
  @ApiBody({ type: ForgotPasswordRequest })
  @ApiResponse({ status: 200, description: 'Email successfully sent' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or user does not exist' })
  async forgotPassword(@Body() forgotPasswordRequest: ForgotPasswordRequest): Promise<void> {
    await this.authService.forgotPassword(forgotPasswordRequest.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Change password for user' })
  @ApiBody({ type: ResetPasswordRequest })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async resetPassword(@Body() resetPasswordRequest: ResetPasswordRequest): Promise<void> {
    await this.authService.resetPassword(resetPasswordRequest.token, resetPasswordRequest.newPassword);
  }
}
