import { Body, Controller, Get, ParseEnumPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { ActivityResponse } from './dto/activity-response';
import { ActivityUpdateRequest } from './dto/activity-update-request';
import { ActivityType } from './enum/activity-type';
import { User } from '../auth/decorator/user.decorator';

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

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateActivity(@Body() updateActivityDto: ActivityUpdateRequest): Promise<ActivityResponse> {
    return this.activityService.updateActivity(updateActivityDto);
  }
}
