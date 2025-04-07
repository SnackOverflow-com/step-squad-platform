import { Activity } from '../model/activity.entity';
import { ActivityResponse } from '../dto/activity-response';

export class ActivityToActivityResponseDtoMapper {
  public map(activity: Activity): ActivityResponse {
    return {
      id: activity.id,
      userId: activity.user.id,
      date: activity.date,
      quantity: activity.quantity,
      goal: activity.goal,
      type: activity.type,
      difficulty: activity.difficulty,
      isGoalReached: activity.isGoalReached,
    } as ActivityResponse;
  }
}
