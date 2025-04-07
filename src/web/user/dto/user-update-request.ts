import { PartialType } from '@nestjs/mapped-types';
import { UserCreateRequest } from './user-create-request';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { Gender } from '../enum/gender';

export class UserUpdateRequest extends PartialType(UserCreateRequest) {
  @IsInt()
  id: number;

  @IsInt()
  age: number;

  @IsString()
  @IsEnum(Gender)
  gender: Gender;
}
