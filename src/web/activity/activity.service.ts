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
import { ActivityHistoryResponse } from './dto/activity-history-response';
import { ActivityTimeRange } from './enum/activity-time-range';

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

  /**
   * Gets user activities for a specified time range
   * If a user doesn't have an activity for a specific day, creates a placeholder with default values
   * @param userId User ID
   * @param type Activity type (STEPS or WATER)
   * @param count The number of time units to go back
   * @param timeRange The time unit (DAYS, WEEKS, MONTHS)
   * @returns An array of activities (actual or placeholder) for the specified time range
   */
  async getActivityHistory(
    userId: number,
    type: ActivityType,
    count: number = 5,
    timeRange: ActivityTimeRange = ActivityTimeRange.DAYS,
  ): Promise<ActivityHistoryResponse> {
    // Find the user
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Generate dates for the requested time range
    const dates: string[] = [];
    const today = new Date();

    // Calculate how many days to go back based on the time range
    for (let i = 0; i < count; i++) {
      const date = new Date(today);

      switch (timeRange) {
        case ActivityTimeRange.DAYS:
          date.setDate(today.getDate() - i);
          break;
        case ActivityTimeRange.WEEKS:
          date.setDate(today.getDate() - i * 7);
          break;
        case ActivityTimeRange.MONTHS:
          date.setMonth(today.getMonth() - i);
          break;
      }

      // Format date to YYYY-MM-DD
      dates.push(date.toISOString().split('T')[0]);
    }

    // Find existing activities for these dates
    const existingActivities = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.user_id = :userId', { userId })
      .andWhere('activity.type = :type', { type })
      .andWhere('activity.date IN (:...dates)', { dates: dates.map((dateStr) => dateStr) })
      .leftJoinAndSelect('activity.user', 'user')
      .getMany();

    // Map each date to an activity (real or placeholder)
    const result: ActivityResponse[] = [];

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      // Safe date comparison that works with both Date objects and string dates
      const existingActivity = existingActivities.find((activity) => {
        // Extract date part regardless of the type of activity.date
        let activityDateStr: string;
        if (activity.date instanceof Date) {
          activityDateStr = activity.date.toISOString().split('T')[0];
        } else if (typeof activity.date === 'string') {
          // If it's already a string, handle it appropriately
          activityDateStr = new Date(activity.date).toISOString().split('T')[0];
        } else {
          // For any other type, try to convert to Date first
          activityDateStr = new Date(String(activity.date)).toISOString().split('T')[0];
        }
        return activityDateStr === dateStr;
      });

      if (existingActivity) {
        // Use existing activity
        result.push(this.activityToActivityResponseDtoMapper.map(existingActivity));
      } else {
        // Create placeholder activity
        const goal = this.generateGoal(type, user.difficulty);
        const placeholderActivity = new Activity();
        placeholderActivity.id = 0; // Use 0 for placeholder
        placeholderActivity.user = user;
        placeholderActivity.date = date;
        placeholderActivity.type = type;
        placeholderActivity.quantity = 0;
        placeholderActivity.goal = goal;
        placeholderActivity.difficulty = user.difficulty;

        result.push(this.activityToActivityResponseDtoMapper.map(placeholderActivity));
      }
    }

    // Sort the activities by date in descending order (most recent first)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { activities: result };
  }
}
