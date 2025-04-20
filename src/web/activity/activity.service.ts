import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './model/activity.entity';
import { ActivityToActivityResponseDtoMapper } from './mapper/activity-to-activity-response-dto-mapper';
import { ActivityUpdateRequest } from './dto/activity-update-request';
import { ActivityResponse } from './dto/activity-response';
import { User } from '../user/model/user.entity';
import { ActivityType } from './enum/activity-type';
import { ActivityDifficulty } from './enum/activity-difficulty';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    private readonly activityToActivityResponseDtoMapper: ActivityToActivityResponseDtoMapper,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Generates an activity goal based on activity type and difficulty
   * @param type Activity type (STEPS or WATER)
   * @param difficulty Activity difficulty (EASY, MEDIUM, or HARD)
   * @returns The goal value appropriate for the type and difficulty
   */
  private generateGoal(type: ActivityType, difficulty: ActivityDifficulty): number {
    if (type === ActivityType.STEPS) {
      switch (difficulty) {
        case ActivityDifficulty.EASY:
          return 7000;
        case ActivityDifficulty.MEDIUM:
          return 10000;
        case ActivityDifficulty.HARD:
          return 20000;
        default:
          return 10000; // Default to MEDIUM if unknown difficulty
      }
    } else if (type === ActivityType.WATER) {
      return 2000; // Water goal is the same for all difficulty levels
    }

    // Default fallback
    return type === ActivityType.STEPS ? 10000 : 2000;
  }

  async getActivity(userId: number, type: ActivityType): Promise<ActivityResponse> {
    const date = new Date();
    // Format date to YYYY-MM-DD to ensure timezone doesn't affect the query
    const dateString = date.toISOString().split('T')[0];

    let activity = await this.activityRepository.findOne({
      where: {
        user: { id: userId },
        date: new Date(dateString), // Use the formatted date string
        type,
      },
      relations: ['user'], // Ensure user relation is loaded if needed by mapper
    });

    if (!activity) {
      this.logger.log(`Activity for user ${userId}, date ${dateString}, type ${type} not found. Creating new one.`);
      const user = await this.userRepository.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Use the user's preferred difficulty to generate the goal
      const goal = this.generateGoal(type, user.difficulty);

      activity = await this.activityRepository.save({
        user,
        date: new Date(dateString),
        type,
        quantity: 0, // Default value
        goal,
        difficulty: user.difficulty, // Use user's preferred difficulty
      });

      this.logger.log(`Created new Activity with ID - ${activity.id}`);

      if (!activity) {
        throw new Error('Failed to create activity');
      }
    }

    return this.activityToActivityResponseDtoMapper.map(activity);
  }

  async updateActivity(updateActivityDto: ActivityUpdateRequest): Promise<ActivityResponse> {
    const id = updateActivityDto.id;
    const activity = await this.activityRepository.findOneBy({ id });

    if (!activity) {
      throw new NotFoundException(`Activity with ID - ${id} not found`);
    }

    activity.updateActivity(updateActivityDto.quantity);
    await this.activityRepository.save(activity);

    this.logger.log(`Activity with ID - ${activity.id} updated`);
    return this.activityToActivityResponseDtoMapper.map(activity);
  }
}
