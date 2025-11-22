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
        console.log(`[CACHE] Checking cache for key: ${key}`);

        const cached = await this.cacheManager.get(key);
        if (cached) {
            console.log(`[CACHE] Cache HIT for ${key} - returning ${Array.isArray(cached) ? cached.length : 0} matches`);
            return cached;
        }

        console.log(`[CACHE] Cache MISS for ${key} - fetching from external API`);
        const data = await this.api.fetchLeagueMatches(leagueId, seasonId);

        // The external API may return an object rather than a plain array.
        // Normalize possible shapes into an array we can reduce over.
        const list: any[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.matches)
                    ? data.matches
                    : [];

        console.log(`[CACHE] Setting cache for ${key} with ${list.length} matches, TTL: 1800 seconds (30 minutes)`);
        await this.cacheManager.set(key, list, 1800); // 30 minutes cache

        return list;
    }

    async getMatchById(matchId: string) {
        return this.api.fetchMatchDetails(matchId);
    }
}
