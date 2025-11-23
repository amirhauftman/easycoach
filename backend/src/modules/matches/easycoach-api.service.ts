import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class EasyCoachApiService {
    private readonly logger = new Logger(EasyCoachApiService.name);
    private readonly baseUrl: string;
    private readonly token: string;

    constructor(private http: HttpService, private config: ConfigService) {
        this.baseUrl = this.config.get<string>('api.baseUrl') ?? '';
        this.token = this.config.get<string>('api.token') ?? '';
    }

    async fetchLeagueMatches(leagueId: string, seasonId: string) {
        try {
            const { data } = await firstValueFrom(
                this.http.get(`${this.baseUrl}/league`, {
                    params: { league_id: leagueId, season_id: seasonId, token: this.token },
                }),
            );
            return data;
        } catch (err) {
            this.handleError(err, 'fetchLeagueMatches');
        }
    }

    async fetchMatchDetails(matchId: string) {
        try {
            const { data } = await firstValueFrom(
                this.http.get(`${this.baseUrl}/match`, {
                    params: { match_id: matchId, token: this.token },
                }),
            );
            return data;
        } catch (err) {
            this.handleError(err, 'fetchMatchDetails');
        }
    }

    private handleError(error: unknown, context: string): never {
        if (error instanceof AxiosError) {
            this.logger.error(`${context} failed: ${error.message}`);
            throw new Error(`EasyCoach API Error: ${error.message}`);
        }
        throw error;
    }
}
