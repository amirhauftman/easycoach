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

  constructor(private readonly matchesService: MatchesService) { }

  @Get()
  @ApiOperation({ summary: 'Get all matches' })
  @ApiResponse({
    status: 200,
    description: 'Returns all matches from database',
  })
  async getMatches() {
    return this.matchesService.getAllMatches();
  }

  @Get('count')
  async getMatchesCount() {
    this.logger.log('GET /matches/count - Getting matches count');
    return {
      count: await this.matchesService.getMatchesCount(),
    };
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
