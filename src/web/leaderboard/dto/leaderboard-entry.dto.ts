import { Gender } from '../../user/enum/gender';

export interface LeaderboardEntryDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  gender: Gender;
  totalSteps: number;
  position: number;
}
