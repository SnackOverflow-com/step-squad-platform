import { Gender } from '../../user/enum/gender';
import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'User age', example: 30, required: false })
  age?: number;

  @ApiProperty({ description: 'User gender', enum: Gender, example: Gender.MALE })
  gender: Gender;

  @ApiProperty({ description: 'Total number of steps', example: 12500 })
  totalSteps: number;

  @ApiProperty({ description: 'Position in leaderboard', example: 1 })
  position: number;
}
