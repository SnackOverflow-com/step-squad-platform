import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../shared/mapper/mapper';
import { LeaderboardEntryDto } from '../dto/leaderboard-entry.dto';
import { User } from '../../user/model/user.entity';

@Injectable()
export class UserActivityToLeaderboardEntryMapper extends Mapper<
  { user: User; totalSteps: number; position: number },
  LeaderboardEntryDto
> {
  public map(userActivity: { user: User; totalSteps: number; position: number }): LeaderboardEntryDto {
    const { user, totalSteps, position } = userActivity;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      gender: user.gender,
      totalSteps,
      position,
    };
  }
}
