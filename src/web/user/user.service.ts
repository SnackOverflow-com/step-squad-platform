import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserCreateRequest } from './dto/user-create-request';
import { UserUpdateRequest } from './dto/user-update-request';
import { User } from './model/user.entity';
import { UserResponse } from './dto/user-response';
import { UserToUserResponseDtoMapper } from './mapper/user-to-user-response-dto-mapper';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userToUserResponseDtoMapper: UserToUserResponseDtoMapper,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: UserCreateRequest): Promise<UserResponse> {
    let user: User = new User();
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.email = createUserDto.email;
    user.password = createUserDto.password;

    user = await this.userRepository.save(user);

    this.logger.log(`User with ID - ${user.id} created`);
    return this.userToUserResponseDtoMapper.map(user);
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.userRepository.find();
    return this.userToUserResponseDtoMapper.mapList(users);
  }

  async getUserById(id: number): Promise<UserResponse> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID - ${id} not found`);
    }

    return this.userToUserResponseDtoMapper.map(user);
  }

  async updateUser(userId: number, updateUserDto: UserUpdateRequest): Promise<UserResponse> {
    const id = userId;
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID - ${id} not found`);
    }

    const ids = updateUserDto.friendIds?.filter(id => id !== userId);
    const friends = ids ? await this.userRepository.findBy({ id: In(ids) }) : null;

    user.updateUser(updateUserDto, friends);
    await this.userRepository.save(user);

    this.logger.log(`User with ID - ${user.id} updated`);
    return this.userToUserResponseDtoMapper.map(user);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
