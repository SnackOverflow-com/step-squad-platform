import { Injectable } from '@nestjs/common';
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
}
