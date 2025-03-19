import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { User } from './model/user.entity';
import { from, map, Observable, switchMap, tap } from 'rxjs';
import { UserResponseDto } from './dto/user-response-dto';
import { UserToUserResponseDtoMapper } from './mapper/user-to-user-response-dto-mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userToUserResponseDtoMapper: UserToUserResponseDtoMapper,
  ) {}

  createUser(createUserDto: UserCreateDto): Observable<UserResponseDto> {
    const user: User = new User();
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.age = createUserDto.age;
    user.email = createUserDto.email;
    user.password = createUserDto.password;
    user.gender = createUserDto.gender;

    return from(this.userRepository.save(user)).pipe(map((user) => this.userToUserResponseDtoMapper.map(user)));
  }

  getAllUsers(): Observable<UserResponseDto[]> {
    return from(this.userRepository.find()).pipe(map((users) => this.userToUserResponseDtoMapper.mapList(users)));
  }

  getUserById(id: number): Observable<UserResponseDto> {
    return from(this.userRepository.findOneBy({ id })).pipe(
      map((user) => {
        if (!user) {
          throw new NotFoundException();
        }

        return this.userToUserResponseDtoMapper.map(user);
      }),
    );
  }

  updateUser(id: number, updateUserDto: UserUpdateDto): Observable<UserResponseDto> {
    return from(this.userRepository.findOneBy({ id })).pipe(
      tap((user) => {
        if (!user) {
          throw new NotFoundException(`User with ID - ${id} not found`);
        }

        user.updateUser(updateUserDto);
      }),
      switchMap((user) => from(this.userRepository.save(user!))),
      map((user) => this.userToUserResponseDtoMapper.map(user)),
    );
  }

  removeUser(id: number): void {
    this.userRepository.delete(id);
  }
}
