import { Injectable } from '@nestjs/common';
import { EasyCoachPlayersApiService } from './easycoach-players-api.service';

@Injectable()
export class PlayersService {
    constructor(private readonly api: EasyCoachPlayersApiService) { }

    async getPlayers(teamId?: string) {
        const data = await this.api.fetchPlayers(teamId);
        // normalize shapes
        const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        return { data: list, meta: { count: list.length } };
    }

    async getPlayerById(id: string) {
        return this.api.fetchPlayerDetails(id);
    }
}
