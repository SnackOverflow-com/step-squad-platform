import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../activity/model/activity.entity';
import { ActivityType } from '../activity/enum/activity-type';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto';
import { UserActivityToLeaderboardEntryMapper } from './mapper/user-activity-to-leaderboard-entry.mapper';
import { LeaderboardPeriod } from './enum/leaderboard-period';
import { User } from '../user/model/user.entity';
import { Between } from 'typeorm';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    private readonly userActivityToLeaderboardEntryMapper: UserActivityToLeaderboardEntryMapper,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntryDto[]> {
    switch (period) {
      case LeaderboardPeriod.DAILY:
        return this.getDailyLeaderboard();
      case LeaderboardPeriod.WEEKLY:
        return this.getWeeklyLeaderboard();
      case LeaderboardPeriod.MONTHLY:
        return this.getMonthlyLeaderboard();
      default:
        this.logger.warn(`Unhandled leaderboard period: ${period}`);
        return [];
    }
  }

  private async getDailyLeaderboard(): Promise<LeaderboardEntryDto[]> {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Find all step activities for today
    const activities = await this.activityRepository.find({
      where: {
        date: new Date(today),
        type: ActivityType.STEPS,
      },
      relations: ['user'],
      order: {
        quantity: 'DESC',
      },
    });

    // Transform the activities into leaderboard entries
    return activities.map((activity, index) => {
      return this.userActivityToLeaderboardEntryMapper.map({
        user: activity.user,
        totalSteps: activity.quantity,
        position: index + 1,
      });
    });
  }

  private async getWeeklyLeaderboard(): Promise<LeaderboardEntryDto[]> {
    // Calculate date range for the current week (from Monday to Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday

    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return this.getAggregatedLeaderboard(monday, sunday);
  }

  private async getMonthlyLeaderboard(): Promise<LeaderboardEntryDto[]> {
    // Calculate date range for the current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);

    return this.getAggregatedLeaderboard(firstDay, lastDay);
  }

  private async getAggregatedLeaderboard(startDate: Date, endDate: Date): Promise<LeaderboardEntryDto[]> {
    // Find all step activities within the date range
    const activities = await this.activityRepository.find({
      where: {
        date: Between(startDate, endDate),
        type: ActivityType.STEPS,
      },
      relations: ['user'],
    });

    // Group activities by user and sum their quantities
    const userStepMap = new Map<number, { user: User; totalSteps: number }>();

    activities.forEach((activity) => {
      const userId = activity.user.id;
      const existingEntry = userStepMap.get(userId);

      if (existingEntry) {
        existingEntry.totalSteps += activity.quantity;
      } else {
        userStepMap.set(userId, {
          user: activity.user,
          totalSteps: activity.quantity,
        });
      }
    });

    // Convert the map to an array and sort by total steps
    const sortedEntries = Array.from(userStepMap.values()).sort((a, b) => b.totalSteps - a.totalSteps);

    // Transform into leaderboard entries with positions
    return sortedEntries.map((entry, index) => {
      return this.userActivityToLeaderboardEntryMapper.map({
        user: entry.user,
        totalSteps: entry.totalSteps,
        position: index + 1,
      });
    });
  }
}
