import { UserResponse } from '../dto/user-response';
import { User } from '../model/user.entity';
import { Mapper } from '../../../shared/mapper/mapper';

export class UserToUserResponseDtoMapper extends Mapper<User, UserResponse> {
  public map(user: User): UserResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    } as UserResponse;
  }
}
