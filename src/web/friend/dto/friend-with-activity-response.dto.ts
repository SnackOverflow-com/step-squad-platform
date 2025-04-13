import { ActivityResponse } from '../../activity/dto/activity-response';
import { FriendResponseDto } from './friend-response.dto';

export interface FriendWithActivityResponseDto extends FriendResponseDto {
  todayStepsActivity?: ActivityResponse;
}
