import { Controller, Get, ParseEnumPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto';
import { LeaderboardPeriod } from './enum/leaderboard-period';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('leaderboard')
@ApiBearerAuth()
@Controller('api/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get leaderboard entries for a specific period' })
  @ApiQuery({ name: 'period', enum: LeaderboardPeriod, description: 'Time period for leaderboard data' })
  @ApiResponse({ status: 200, description: 'Leaderboard data retrieved successfully', type: [LeaderboardEntryDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  getLeaderboard(
    @Query('period', new ParseEnumPipe(LeaderboardPeriod)) period: LeaderboardPeriod,
  ): Promise<LeaderboardEntryDto[]> {
    return this.leaderboardService.getLeaderboard(period);
  }
}
