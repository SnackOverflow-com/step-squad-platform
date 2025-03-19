import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { Observable, tap } from 'rxjs';
import { UserResponseDto } from './dto/user-response-dto';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: UserCreateDto): Observable<UserResponseDto> {
    return this.userService
      .createUser(createUserDto)
      .pipe(tap((user) => this.logger.log(`User with ID - ${user.id} created`)));
  }

  @Get('list')
  getAllUsers(): Observable<UserResponseDto[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  getUserById(@Param('id') id: number): Observable<UserResponseDto> {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UserUpdateDto) {
    return this.userService
      .updateUser(id, updateUserDto)
      .pipe(tap((user) => this.logger.log(`User with ID - ${user.id} updated`)));
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.removeUser(+id);
  }
}
