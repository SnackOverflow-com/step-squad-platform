import { PartialType } from '@nestjs/mapped-types';
import { UserCreateRequest } from './user-create-request';
import { IsArray, IsEnum, IsInt, IsString } from 'class-validator';
import { Gender } from '../enum/gender';
import { ActivityDifficulty } from '../../activity/enum/activity-difficulty';

export class UserUpdateRequest extends PartialType(UserCreateRequest) {
  @IsInt()
  id: number;

  @IsInt()
  age: number;

  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsEnum(ActivityDifficulty)
  difficulty: ActivityDifficulty;

  @IsArray()
  friendIds?: number[];
}
