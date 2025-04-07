import { ActivityType } from '../enum/activity-type';
import { ActivityDifficulty } from '../enum/activity-difficulty';

export interface ActivityResponse {
  id: number;
  userId: number;
  date: Date;
  quantity: number;
  goal: number;
  type: ActivityType;
  difficulty: ActivityDifficulty;
  isGoalReached: boolean;
}
