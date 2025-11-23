import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  private readonly logger = new Logger(MatchesController.name);

  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all matches' })
  @ApiResponse({
    status: 200,
    description: 'Returns all matches from database',
  })
  async getMatches() {
    this.logger.log('GET /matches - Fetching all matches from database');
    return this.matchesService.getAllMatches();
  }

  @Get('count')
  async getMatchesCount() {
    this.logger.log('GET /matches/count - Getting matches count');
    return {
      count: await this.matchesService.getMatchesCount(),
    };
  }

  @Post('sync')
  async syncMatches(
    @Query('leagueId') leagueId = '726',
    @Query('seasonId') seasonId = '25',
  ) {
    this.logger.log(
      `POST /matches/sync - Syncing matches for league ${leagueId}, season ${seasonId}`,
    );
    try {
      const result = await this.matchesService.syncMatchesFromApi(
        leagueId,
        seasonId,
      );
      return {
        success: true,
        message: `Successfully synced ${result.synced} out of ${result.total} matches`,
        ...result,
      };
    } catch (error) {
      this.logger.error('Error syncing matches:', error.message);
      throw new HttpException(
        `Failed to sync matches: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('update-competition')
  async updateCompetitionData() {
    this.logger.log(
      'POST /matches/update-competition - Updating existing matches with competition data',
    );
    try {
      const result =
        await this.matchesService.updateExistingMatchesWithCompetition();
      return {
        success: true,
        message: `Updated ${result.updated} out of ${result.total} matches with competition data`,
        ...result,
      };
    } catch (error) {
      this.logger.error('Error updating competition data:', error.message);
      throw new HttpException(
        `Failed to update competition data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getMatch(@Param('id') id: string) {
    this.logger.log(`GET /matches/${id} - Fetching match`);
    const match = await this.matchesService.getMatchById(id);
    if (!match) {
      throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
    }
    return match;
  }

  @Get('player/:playerId')
  async getMatchesByPlayer(@Param('playerId') playerId: string) {
    this.logger.log(
      `GET /matches/player/${playerId} - Fetching matches for player`,
    );
    return this.matchesService.getMatchesByPlayerId(playerId);
  }

  @Post()
  async createMatch(@Body() createMatchDto: CreateMatchDto) {
    this.logger.log('POST /matches - Creating new match');
    return this.matchesService.createMatch(createMatchDto);
  }

  @Put(':id')
  async updateMatch(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateMatchDto>,
  ) {
    this.logger.log(`PUT /matches/${id} - Updating match`);
    const match = await this.matchesService.updateMatch(+id, updateData);
    if (!match) {
      throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
    }
    return match;
  }

  @Delete(':id')
  async deleteMatch(@Param('id') id: string) {
    this.logger.log(`DELETE /matches/${id} - Deleting match`);
    await this.matchesService.deleteMatch(+id);
    return { message: 'Match deleted successfully' };
  }
}
