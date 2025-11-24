import {
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { UpdatePlayerStatsDto } from './dto/update-player-stats.dto';

@ApiTags('players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) { }

  @Get()
  async getPlayers(@Query('teamId') teamId?: string) {
    return this.playersService.getPlayers(teamId);
  }

  @Get(':id')
  async getPlayer(@Param('id') id: string) {
    const p = await this.playersService.getPlayerById(id);
    if (!p) throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    return p;
  }

  @Get(':id/matches')
  async getPlayerMatches(@Param('id') id: string) {
    return this.playersService.getPlayerMatches(id);
  }

  @Patch(':id/stats')
  @ApiOperation({ summary: 'Partially update player statistics' })
  @ApiResponse({ status: 200, description: 'Player stats updated successfully' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  async patchPlayerStats(
    @Param('id') id: string,
    @Body() updateStatsDto: Partial<UpdatePlayerStatsDto>,
  ) {
    const result = await this.playersService.updatePlayerStats(id, updateStatsDto);
    if (!result) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Player stats updated successfully', data: result };
  }
}
