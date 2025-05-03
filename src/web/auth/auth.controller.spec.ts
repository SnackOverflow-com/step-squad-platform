import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRegisterRequest } from './dto/user-register-request';
import { UserLoginRequest } from './dto/user-login-request';
import { UserLoginResponse } from './dto/user-login-response';
import { ForgotPasswordRequest } from './dto/forgot-password-request';
import { ResetPasswordRequest } from './dto/reset-password-request';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  // Mock AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  // Mock LocalAuthGuard
  const mockLocalAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: LocalAuthGuard, useValue: mockLocalAuthGuard },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerRequest: UserRegisterRequest = {
      firstName: 'Test',
      lastName: '1',
      email: 'test@example.com',
      password: 'password123',
    };
    const registerResponse: UserLoginResponse = {
      token: 'jwt-token',
    };

    it('should register a new user successfully', async () => {
      authService.register.mockResolvedValue(registerResponse);

      const result = await controller.register(registerRequest);

      expect(authService.register).toHaveBeenCalledWith(registerRequest);
      expect(result).toEqual(registerResponse);
    });

    it('should throw BadRequestException if user already exists', async () => {
      authService.register.mockRejectedValue(new BadRequestException('User already exists'));

      await expect(controller.register(registerRequest)).rejects.toThrow(BadRequestException);
      expect(authService.register).toHaveBeenCalledWith(registerRequest);
    });
  });

  describe('login', () => {
    const loginRequest: UserLoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };
    const loginResponse: UserLoginResponse = {
      token: 'jwt-token',
    };

    it('should login user successfully', async () => {
      authService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginRequest);

      expect(authService.login).toHaveBeenCalledWith(loginRequest);
      expect(result).toEqual(loginResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginRequest)).rejects.toThrow(UnauthorizedException);
      expect(authService.login).toHaveBeenCalledWith(loginRequest);
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordRequest: ForgotPasswordRequest = {
      email: 'test@example.com',
    };

    it('should send forgot password email successfully', async () => {
      authService.forgotPassword.mockResolvedValue(undefined);

      await controller.forgotPassword(forgotPasswordRequest);

      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordRequest.email);
    });

    it('should throw BadRequestException if user does not exist', async () => {
      authService.forgotPassword.mockRejectedValue(new BadRequestException('User does not exist'));

      await expect(controller.forgotPassword(forgotPasswordRequest)).rejects.toThrow(BadRequestException);
      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordRequest.email);
    });
  });

  describe('resetPassword', () => {
    const resetPasswordRequest: ResetPasswordRequest = {
      token: 'reset-token',
      newPassword: 'newPassword123',
    };

    it('should reset password successfully', async () => {
      authService.resetPassword.mockResolvedValue(undefined);

      await controller.resetPassword(resetPasswordRequest);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordRequest.token,
        resetPasswordRequest.newPassword,
      );
    });

    it('should throw BadRequestException for invalid token', async () => {
      authService.resetPassword.mockRejectedValue(new BadRequestException('Invalid token'));

      await expect(controller.resetPassword(resetPasswordRequest)).rejects.toThrow(BadRequestException);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordRequest.token,
        resetPasswordRequest.newPassword,
      );
    });
  });
});
