import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class EasyCoachPlayersApiService {
    private readonly logger = new Logger(EasyCoachPlayersApiService.name);
    private readonly baseUrl: string;
    private readonly token: string;

    constructor(private http: HttpService, private config: ConfigService) {
        this.baseUrl = this.config.get<string>('api.baseUrl') ?? '';
        this.token = this.config.get<string>('api.token') ?? '';
    }

    async fetchPlayers(teamId?: string) {
        try {
            const { data } = await firstValueFrom(
                this.http.get(`${this.baseUrl}/players`, { params: { team_id: teamId, user_token: this.token } }),
            );
            return data;
        } catch (err) {
            if (err instanceof AxiosError) {
                this.logger.error(`fetchPlayers failed: ${err.message}`);
            }
            return [];
        }
    }

    async fetchPlayerDetails(playerId: string) {
        try {
            const { data } = await firstValueFrom(
                this.http.get(`${this.baseUrl}/player`, { params: { player_id: playerId, user_token: this.token } }),
            );
            return data;
        } catch (err) {
            if (err instanceof AxiosError) {
                this.logger.error(`fetchPlayerDetails failed: ${err.message}`);
            }
            return null;
        }
    }
}
