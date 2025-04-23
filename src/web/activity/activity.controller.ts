import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { ActivityResponse } from './dto/activity-response';
import { ActivityUpdateRequest } from './dto/activity-update-request';
import { ActivityType } from './enum/activity-type';
import { User } from '../auth/decorator/user.decorator';
import { ActivityHistoryResponse } from './dto/activity-history-response';
import { ActivityTimeRange } from './enum/activity-time-range';

@Controller('api/activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getActivity(
    @User('userId') userId: number,
    @Query('type', new ParseEnumPipe(ActivityType)) type: ActivityType,
  ): Promise<ActivityResponse> {
    return this.activityService.getActivity(userId, type);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getActivityHistory(
    @User('userId') userId: number,
    @Query('type', new ParseEnumPipe(ActivityType)) type: ActivityType,
    @Query('count', new DefaultValuePipe(5), ParseIntPipe) count: number,
    @Query('timeRange', new DefaultValuePipe(ActivityTimeRange.DAYS), new ParseEnumPipe(ActivityTimeRange))
    timeRange: ActivityTimeRange,
  ): Promise<ActivityHistoryResponse> {
    return this.activityService.getActivityHistory(userId, type, count, timeRange);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateActivity(@Body() updateActivityDto: ActivityUpdateRequest): Promise<ActivityResponse> {
    return this.activityService.updateActivity(updateActivityDto);
  }
}
