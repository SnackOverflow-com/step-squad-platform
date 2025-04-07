import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './model/activity.entity';
import { ActivityToActivityResponseDtoMapper } from './mapper/activity-to-activity-response-dto-mapper';
import { ActivityUpdateRequest } from './dto/activity-update-request';
import { ActivityResponse } from './dto/activity-response';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    private readonly activityToActivityResponseDtoMapper: ActivityToActivityResponseDtoMapper,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
  ) {}

  async getActivity(): Promise<ActivityResponse> {
    const date = new Date();
    const activity = await this.activityRepository.findOneBy({ date });

    if (!activity) {
      throw new NotFoundException(`Activity for date - ${date} not found`);
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
