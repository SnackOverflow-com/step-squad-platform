import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { ActivityResponse } from './dto/activity-response';
import { ActivityUpdateRequest } from './dto/activity-update-request';

@Controller('api/activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getActivity(): Promise<ActivityResponse> {
    return this.activityService.getActivity();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateActivity(@Body() updateActivityDto: ActivityUpdateRequest): Promise<ActivityResponse> {
    return this.activityService.updateActivity(updateActivityDto);
  }
}
