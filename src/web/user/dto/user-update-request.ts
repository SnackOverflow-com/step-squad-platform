import { Gender } from '../enum/gender';
import { ActivityDifficulty } from '../../activity/enum/activity-difficulty';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class UserUpdateRequest {
  @ApiProperty({ description: 'User first name', example: 'John', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'User last name', example: 'Doe', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'User age', example: 30, minimum: 1, maximum: 120, required: false })
  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  age?: number;

  @ApiProperty({ description: 'User gender', enum: Gender, example: Gender.MALE, required: false })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: 'Preferred activity difficulty',
    enum: ActivityDifficulty,
    example: ActivityDifficulty.MEDIUM,
    required: false,
  })
  @IsEnum(ActivityDifficulty)
  @IsOptional()
  difficulty?: ActivityDifficulty;

  @ApiProperty({
    description: 'List of friend user IDs',
    type: [Number],
    example: [1, 2, 3],
    required: false,
  })
  @IsArray()
  @IsOptional()
  friendIds?: number[];
}
