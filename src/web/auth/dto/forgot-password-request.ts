import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordRequest {
  @ApiProperty({ description: 'Email address', example: 'step.squad@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
