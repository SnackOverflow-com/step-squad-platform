import { ApiProperty } from '@nestjs/swagger';

export class UserLoginResponse {
  @ApiProperty({ description: 'JWT authentication token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;
}
