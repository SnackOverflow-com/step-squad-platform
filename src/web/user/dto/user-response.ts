import { Gender } from '../enum/gender';
import { ActivityDifficulty } from '../../activity/enum/activity-difficulty';

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: Gender;
  difficulty: ActivityDifficulty;
}
