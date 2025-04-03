import { Gender } from '../model/gender';

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: Gender;
}
