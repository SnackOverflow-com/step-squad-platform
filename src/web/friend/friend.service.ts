import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/model/user.entity';
import { FriendResponseDto } from './dto/friend-response.dto';
import { UserToFriendResponseMapper } from './mapper/user-to-friend-response.mapper';
import { FriendSearchRequestDto } from './dto/friend-search-request.dto';
import { Activity } from '../activity/model/activity.entity';
import { FriendWithActivityResponseDto } from './dto/friend-with-activity-response.dto';
import { ActivityToActivityResponseDtoMapper } from '../activity/mapper/activity-to-activity-response-dto-mapper';
import { ActivityType } from '../activity/enum/activity-type';

@Injectable()
export class FriendService {
  constructor(
    private readonly userToFriendResponseMapper: UserToFriendResponseMapper,
    private readonly activityToActivityResponseDtoMapper: ActivityToActivityResponseDtoMapper,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
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

  async getFriendsWithActivities(userId: number): Promise<FriendWithActivityResponseDto[]> {
    // Get the user with their friends loaded
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    if (!user || !user.friends || user.friends.length === 0) {
      return [];
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Map friends to response DTOs
    const friendDtos = this.userToFriendResponseMapper.mapListWithCurrentUser(user.friends, user);

    // For each friend, fetch their today's steps activity
    const friendsWithActivities: FriendWithActivityResponseDto[] = await Promise.all(
      friendDtos.map(async (friendDto) => {
        // Fetch today's steps activity for this friend
        const stepsActivity = await this.activityRepository.findOne({
          where: {
            user: { id: friendDto.id },
            date: new Date(today),
            type: ActivityType.STEPS,
          },
        });

        // Return friend with their steps activity if found
        return {
          ...friendDto,
          todayStepsActivity: stepsActivity ? this.activityToActivityResponseDtoMapper.map(stepsActivity) : undefined,
        };
      }),
    );

    return friendsWithActivities;
  }

  async deleteFriend(userId: number, friendId: number): Promise<void> {
    // First check if both users exist
    const userExists = await this.userRepository.exist({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the relationship exists using a more efficient query
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.friends', 'friend')
      .where('user.id = :userId', { userId })
      .andWhere('friend.id = :friendId', { friendId });

    const relationship = await queryBuilder.getOne();
    if (!relationship) {
      throw new NotFoundException(`Friend with ID ${friendId} not found in user's friend list`);
    }

    // Use the query builder to directly remove the relation in the join table
    await this.userRepository.createQueryBuilder().relation(User, 'friends').of(userId).remove(friendId);
  }

  async addFriend(userId: number, friendId: number): Promise<void> {
    // Prevent adding oneself as a friend
    if (userId === friendId) {
      throw new BadRequestException('Cannot add yourself as a friend');
    }

    // Check if both users exist
    const userExists = await this.userRepository.exist({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const friendExists = await this.userRepository.exist({ where: { id: friendId } });
    if (!friendExists) {
      throw new NotFoundException(`User with ID ${friendId} not found`);
    }

    // Check if they are already friends
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.friends', 'friend')
      .where('user.id = :userId', { userId })
      .andWhere('friend.id = :friendId', { friendId });

    const relationship = await queryBuilder.getOne();
    if (relationship) {
      throw new BadRequestException(`User with ID ${friendId} is already a friend`);
    }

    // Add the friend relationship
    await this.userRepository.createQueryBuilder().relation(User, 'friends').of(userId).add(friendId);
  }
}
