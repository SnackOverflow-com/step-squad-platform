import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { User } from '../user/model/user.entity';
import { UserToFriendResponseMapper } from './mapper/user-to-friend-response.mapper';
import { UserModule } from '../user/user.module';
import { Activity } from '../activity/model/activity.entity';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Activity]), UserModule, ActivityModule],
  controllers: [FriendController],
  providers: [FriendService, UserToFriendResponseMapper],
  exports: [FriendService],
})
export class FriendModule {}
