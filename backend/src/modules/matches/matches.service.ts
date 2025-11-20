import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EasyCoachApiService } from './easycoach-api.service';

@Injectable()
export class MatchesService {
    constructor(
        private readonly api: EasyCoachApiService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    private cacheKey(leagueId: string, seasonId: string) {
        return `matches:${leagueId}:${seasonId}`;
    }

    async getMatches(leagueId: string, seasonId: string) {
        const key = this.cacheKey(leagueId, seasonId);
        const cached = await this.cacheManager.get(key);
        if (cached) {
            return { data: cached, meta: { cached: true } };
        }

        const data = await this.api.fetchLeagueMatches(leagueId, seasonId);
        await this.cacheManager.set(key, data, 60 * 5);

        // The external API may return an object rather than a plain array.
        // Normalize possible shapes into an array we can reduce over.
        const list: any[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.matches)
            ? data.matches
            : [];

        const grouped = list.reduce((acc: any, item: any) => {
            const date = (item.match_date || item.kickoff || '').slice(0, 10) || 'unknown';
            acc[date] = acc[date] || [];
            acc[date].push(item);
            return acc;
        }, {});

        return { data: grouped, meta: { cached: false } };
    }

    async getMatchById(matchId: string) {
        return this.api.fetchMatchDetails(matchId);
    }
}
