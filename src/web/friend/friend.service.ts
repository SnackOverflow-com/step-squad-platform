import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/model/user.entity';
import { FriendResponseDto } from './dto/friend-response.dto';
import { UserToFriendResponseMapper } from './mapper/user-to-friend-response.mapper';
import { FriendSearchRequestDto } from './dto/friend-search-request.dto';

@Injectable()
export class FriendService {
  constructor(
    private readonly userToFriendResponseMapper: UserToFriendResponseMapper,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async searchUsers(userId: number, searchParams: FriendSearchRequestDto): Promise<FriendResponseDto[]> {
    const { query } = searchParams;

    // Get current user with friends loaded
    const currentUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    // Search users by firstName or lastName if query is provided
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Don't include the current user in search results
    queryBuilder.where('user.id != :userId', { userId });

    // Apply search filter if query is provided
    if (query) {
      queryBuilder.andWhere('(LOWER(user.firstName) LIKE LOWER(:query) OR LOWER(user.lastName) LIKE LOWER(:query))', {
        query: `%${query}%`,
      });
    }

    const users = await queryBuilder.getMany();

    // Map results to DTOs with isFriend flag
    return this.userToFriendResponseMapper.mapListWithCurrentUser(users, currentUser || undefined);
  }
}
