import { UserResponse } from '../../user/dto/user-response';

export interface FriendResponseDto extends UserResponse {
  isFriend: boolean;
}
