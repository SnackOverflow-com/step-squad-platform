import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { UserRegisterRequest } from './dto/user-register-request';
import { UserLoginRequest } from './dto/user-login-request';
import { UserLoginResponse } from './dto/user-login-response';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userRegisterRequest: UserRegisterRequest): Promise<UserLoginResponse> {
    return this.authService.register(userRegisterRequest);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Body() userLoginRequest: UserLoginRequest): Promise<UserLoginResponse> {
    return this.authService.login(userLoginRequest);
  }
}
