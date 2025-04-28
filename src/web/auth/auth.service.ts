import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { TokenPayload } from './dto/token-payload';
import { UserCreateRequest } from '../user/dto/user-create-request';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/model/user.entity';
import { Repository } from 'typeorm';
import { UserRegisterRequest } from './dto/user-register-request';
import { UserLoginRequest } from './dto/user-login-request';
import { UserLoginResponse } from './dto/user-login-response';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(userLoginRequest: UserLoginRequest): Promise<any> {
    const email = userLoginRequest.email;
    const user = await this.userRepository.findOneBy({ email });

    if (user && (await bcrypt.compare(userLoginRequest.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(userLoginRequest: UserLoginRequest): Promise<UserLoginResponse> {
    const user: User = await this.validateUser(userLoginRequest);

    const token: TokenPayload = { email: user.email, sub: user.id };
    const jwt: string = this.jwtService.sign(token);

    return { token: jwt } as UserLoginResponse;
  }

  async register(userRegisterRequest: UserRegisterRequest): Promise<UserLoginResponse> {
    const hashedPassword = await bcrypt.hash(userRegisterRequest.password, 10);

    await this.usersService.createUser({
      firstName: userRegisterRequest.firstName,
      lastName: userRegisterRequest.lastName,
      email: userRegisterRequest.email,
      password: hashedPassword,
    } as UserCreateRequest);

    return this.login({
      email: userRegisterRequest.email,
      password: userRegisterRequest.password,
    } as UserLoginRequest);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Generate JWT token with user ID and email
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    // Create reset link
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 20px; background-color: #FF9A01; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Step Squad</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px; color: #333333;">
                    <h2 style="font-size: 20px; margin: 0 0 20px;">Reset Your Password</h2>
                    <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                      You requested to reset your password for your Step Squad account. Click the button below to set a new password:
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #FF9A01; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 4px;">Reset Password</a>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size: 16px; line-height: 1.5; margin: 0;">
                      If you didn’t request a password reset, please ignore this email or contact support.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; color: #666666; font-size: 14px;">
                    <p style="margin: 0;">&copy; 2025 Step Squad. All rights reserved.</p>
                    <p style="margin: 10px 0 0;">
                      <a href="mailto:support@stepsquad.com" style="color: #007bff; text-decoration: none;">Contact Support</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email
    await this.mailerService.sendMail({
      from: this.configService.get<string>('FROM_EMAIL'),
      to: email,
      subject: 'Step Squad password reset request',
      html: htmlTemplate,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ where: { id: payload.sub, email: payload.email } });

      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      user.updatePassword(hashedPassword);
      await this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
