import { UserResponseDto } from '../dto/user-response-dto';
import { User } from '../model/user.entity';
import { Mapper } from '../../../shared/mapper/mapper';

export class UserToUserResponseDtoMapper extends Mapper<User, UserResponseDto> {
  public map(user: User): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    } as UserResponseDto;
  }
}
