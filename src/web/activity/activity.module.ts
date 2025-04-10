import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { Activity } from './model/activity.entity';
import { ActivityToActivityResponseDtoMapper } from './mapper/activity-to-activity-response-dto-mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityToActivityResponseDtoMapper],
  exports: [ActivityService],
})
export class ActivityModule {}
