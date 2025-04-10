import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserUpdateRequest } from './dto/user-update-request';
import { UserResponse } from './dto/user-response';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../auth/decorator/user.decorator';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@User('userId') userId: number): Promise<UserResponse> {
    return this.userService.getUserById(userId);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  getAllUsers(@User('userId') userId: number): Promise<UserResponse[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getUserById(@User('userId') userId: number, @Param('id') id: number): Promise<UserResponse> {
    return this.userService.getUserById(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  updateUser(@User('userId') userId: number, @Body() updateUserDto: UserUpdateRequest): Promise<UserResponse> {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteUser(@User('userId') userId: number, @Param('id') id: number): Promise<void> {
    return this.userService.deleteUser(+id);
  }
}
