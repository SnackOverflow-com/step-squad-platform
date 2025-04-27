import { Gender } from '../enum/gender';
import { ActivityDifficulty } from '../../activity/enum/activity-difficulty';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'User age', example: 30 })
  age: number;

  @ApiProperty({ description: 'User gender', enum: Gender, example: Gender.MALE })
  gender: Gender;

  @ApiProperty({
    description: 'Preferred activity difficulty',
    enum: ActivityDifficulty,
    example: ActivityDifficulty.MEDIUM,
  })
  difficulty: ActivityDifficulty;
}
