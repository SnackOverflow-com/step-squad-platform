import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserUpdateRequest } from './dto/user-update-request';
import { UserResponse } from './dto/user-response';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../auth/decorator/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@ApiBearerAuth()
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: UserResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  async getCurrentUser(@User('userId') userId: number): Promise<UserResponse> {
    return this.userService.getUserById(userId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully', type: UserResponse })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  updateUser(@User('userId') userId: number, @Body() updateUserDto: UserUpdateRequest): Promise<UserResponse> {
    return this.userService.updateUser(userId, updateUserDto);
  }
}
