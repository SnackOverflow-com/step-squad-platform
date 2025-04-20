import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { User } from '../user/model/user.entity';
import { Activity } from '../activity/model/activity.entity';
import { UserActivityToLeaderboardEntryMapper } from './mapper/user-activity-to-leaderboard-entry.mapper';
import { UserModule } from '../user/user.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Activity]), UserModule, ActivityModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, UserActivityToLeaderboardEntryMapper],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
