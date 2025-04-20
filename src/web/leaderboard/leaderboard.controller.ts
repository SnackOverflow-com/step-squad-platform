import { Controller, Get, ParseEnumPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto';
import { LeaderboardPeriod } from './enum/leaderboard-period';

@Controller('api/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getLeaderboard(
    @Query('period', new ParseEnumPipe(LeaderboardPeriod)) period: LeaderboardPeriod,
  ): Promise<LeaderboardEntryDto[]> {
    return this.leaderboardService.getLeaderboard(period);
  }
}
