import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PlayersService } from './players.service';

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
}
