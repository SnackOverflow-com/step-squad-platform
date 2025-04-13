import { IsOptional, IsString } from 'class-validator';

export class FriendSearchRequestDto {
  @IsString()
  @IsOptional()
  query?: string;
}
