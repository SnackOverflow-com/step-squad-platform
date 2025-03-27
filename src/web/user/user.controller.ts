import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateRequest } from './dto/user-create-request';
import { UserUpdateRequest } from './dto/user-update-request';
import { UserResponse } from './dto/user-response';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createUser(@Body() createUserDto: UserCreateRequest): Promise<UserResponse> {
    return this.userService.createUser(createUserDto);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  getAllUsers(): Promise<UserResponse[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getUserById(@Param('id') id: number): Promise<UserResponse> {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateUser(@Param('id') id: number, @Body() updateUserDto: UserUpdateRequest): Promise<UserResponse> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param('id') id: number): Promise<void> {
    return this.userService.deleteUser(+id);
  }
}
