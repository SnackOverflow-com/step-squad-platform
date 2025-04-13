import { Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../auth/decorator/user.decorator';
import { FriendResponseDto } from './dto/friend-response.dto';
import { FriendSearchRequestDto } from './dto/friend-search-request.dto';
import { FriendWithActivityResponseDto } from './dto/friend-with-activity-response.dto';

@Controller('api/friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  searchUsers(
    @User('userId') userId: number,
    @Query() searchParams: FriendSearchRequestDto,
  ): Promise<FriendResponseDto[]> {
    return this.friendService.searchUsers(userId, searchParams);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  getFriendsWithActivities(@User('userId') userId: number): Promise<FriendWithActivityResponseDto[]> {
    return this.friendService.getFriendsWithActivities(userId);
  }

  @Delete(':friendId')
  @UseGuards(JwtAuthGuard)
  deleteFriend(@User('userId') userId: number, @Param('friendId') friendId: number): Promise<void> {
    return this.friendService.deleteFriend(userId, +friendId);
  }

  @Put(':friendId')
  @UseGuards(JwtAuthGuard)
  addFriend(@User('userId') userId: number, @Param('friendId') friendId: number): Promise<void> {
    return this.friendService.addFriend(userId, +friendId);
  }
}
