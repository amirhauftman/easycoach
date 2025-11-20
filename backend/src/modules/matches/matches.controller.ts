import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) { }

    @Get()
    async getMatches(@Query('leagueId') leagueId = '726', @Query('seasonId') seasonId = '26') {
        return this.matchesService.getMatches(leagueId, seasonId);
    }

    @Get(':id')
    async getMatch(@Param('id') id: string) {
        const match = await this.matchesService.getMatchById(id);
        if (!match) {
            throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
        }
        return match;
    }
}
