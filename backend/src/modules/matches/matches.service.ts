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
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[CACHE:${requestId}] Checking cache for key: ${key}`);

        const cached = await this.cacheManager.get(key);
        if (cached) {
            console.log(`[CACHE:${requestId}] Cache HIT for ${key} - returning ${Array.isArray(cached) ? cached.length : 0} matches`);
            return cached;
        }

        console.log(`[CACHE:${requestId}] Cache MISS for ${key} - fetching from external API`);
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

        console.log(`[CACHE:${requestId}] Setting cache for ${key} with ${list.length} matches, TTL: 1800000ms (30 minutes)`);
        // Use milliseconds for TTL to be more explicit
        await this.cacheManager.set(key, list, 1800000); // 30 minutes in milliseconds

        // Verify the cache was set
        const verify = await this.cacheManager.get(key);
        console.log(`[CACHE:${requestId}] Cache verification: ${verify ? 'SUCCESS' : 'FAILED'} for ${key}`);

        return list;
    }

    async getMatchById(matchId: string) {
        return this.api.fetchMatchDetails(matchId);
    }
}
