import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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
}
