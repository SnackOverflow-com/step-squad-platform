import { PartialType } from '@nestjs/mapped-types';
import { UserCreateRequest } from './user-create-request';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { Gender } from '../model/gender';

export class UserUpdateRequest extends PartialType(UserCreateRequest) {
  @IsInt()
  age: number;

  @IsString()
  @IsEnum(Gender)
  gender: Gender;
}
