import {
    Injectable,
    Logger,
    BadRequestException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
    LeagueMatchesResponse,
    MatchDetailsResponse,
} from './interfaces/easycoach-api.interfaces';

@Injectable()
export class EasyCoachApiService {
    private readonly logger = new Logger(EasyCoachApiService.name);
    private readonly baseUrl: string;
    private readonly token: string;

    constructor(
        private http: HttpService,
        private config: ConfigService,
    ) {
        this.baseUrl = this.config.get<string>('api.baseUrl')!;
        this.token = this.config.get<string>('api.token', '');

        if (!this.baseUrl) {
            throw new Error('Missing required API configuration: baseUrl');
        }

        if (!this.token) {
            this.logger.warn('API_TOKEN is not configured. API calls may fail if authentication is required.');
        }

        this.logger.log(`EasyCoach API Service initialized with baseUrl: ${this.baseUrl}`);
    }

    async fetchLeagueMatches(
        leagueId: string,
        seasonId: string,
    ): Promise<LeagueMatchesResponse> {
        if (!leagueId || !seasonId) {
            throw new BadRequestException('Invalid league or season ID');
        }
        try {
            const headers = this.token
                ? { Authorization: `Bearer ${this.token}` }
                : {};

            const response = await firstValueFrom(
                this.http.get(`${this.baseUrl}/league`, {
                    params: { league_id: leagueId, season_id: seasonId },
                    headers,
                }),
            );
            this.logger.log(
                `Successfully fetched league matches for league ${leagueId}, season ${seasonId}`,
            );
            return response.data as LeagueMatchesResponse;
        } catch (err) {
            this.handleError(err, 'fetchLeagueMatches');
        }
    }

    async fetchMatchDetails(matchId: string): Promise<MatchDetailsResponse> {
        if (!matchId) {
            throw new BadRequestException('Invalid match ID');
        }
        try {
            const headers = this.token
                ? { Authorization: `Bearer ${this.token}` }
                : {};

            const response = await firstValueFrom(
                this.http.get(`${this.baseUrl}/match`, {
                    params: { match_id: matchId },
                    headers,
                }),
            );
            this.logger.log(
                `Successfully fetched match details for match ${matchId}`,
            );
            return response.data as MatchDetailsResponse;
        } catch (err) {
            this.handleError(err, 'fetchMatchDetails');
        }
    }

    private handleError(error: unknown, context: string): never {
        const message =
            error instanceof AxiosError ? error.message : 'Unknown error';
        this.logger.error(
            `${context} failed: ${message}`,
            error instanceof Error ? error.stack : '',
        );
        throw new HttpException(
            `EasyCoach API Error: ${message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}
