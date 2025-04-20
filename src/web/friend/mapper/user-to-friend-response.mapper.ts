import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../shared/mapper/mapper';
import { User } from '../../user/model/user.entity';
import { FriendResponseDto } from '../dto/friend-response.dto';

@Injectable()
export class UserToFriendResponseMapper extends Mapper<User, FriendResponseDto> {
  private currentUser: User | undefined;

  setCurrentUser(user: User | undefined): void {
    this.currentUser = user;
  }

  public map(user: User): FriendResponseDto {
    const isFriend = this.currentUser?.friends?.some((friend) => friend.id === user.id) || false;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      gender: user.gender,
      difficulty: user.difficulty,
      isFriend,
    };
  }

  public mapListWithCurrentUser(users: User[], currentUser: User | undefined): FriendResponseDto[] {
    this.setCurrentUser(currentUser);
    return this.mapList(users);
  }
}
