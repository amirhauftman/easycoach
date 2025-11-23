import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { EasyCoachApiService } from './easycoach-api.service';
import { Match } from './entities/match.entity';
import { Player } from '../players/entities/player.entity';
import { MatchEvent } from './entities/match-event.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import {
    ApiMatchResponse,
    hasDataProperty,
    MatchSyncResult,
    CompetitionUpdateResult
} from './interfaces/api-match.interfaces';

@Injectable()
export class MatchesService {
    private readonly logger = new Logger(MatchesService.name);
    private readonly FULL_MATCH_MINUTES = 90;
    private readonly DEFAULT_LEAGUE_ID = '726';
    private readonly DEFAULT_SEASON_ID = '25';

    constructor(
        @InjectRepository(Match)
        private readonly matchRepository: Repository<Match>,
        private readonly api: EasyCoachApiService,
        private readonly dataSource: DataSource,
    ) { }

    async getAllMatches() {
        this.logger.log('Fetching all matches from database');
        let matches = await this.matchRepository.find({
            order: { match_date: 'DESC' },
        });

        if (matches.length === 0) {
            this.logger.log('No matches in DB, syncing from API');
            await this.syncMatchesFromApi();
            matches = await this.matchRepository.find({
                order: { match_date: 'DESC' },
            });
        }

        return matches;
    }

    /**
     * Fetch match details by ID, trying API first then falling back to database
     */
    async getMatchById(matchId: string): Promise<ApiMatchResponse | null> {
        this.logger.log(`Fetching match with ID: ${matchId}`);

        // For match details, always try API first since DB doesn't have player data
        try {
            this.logger.log(`Fetching detailed match ${matchId} from API`);
            const apiMatchRaw = await this.api.fetchMatchDetails(matchId);
            const apiMatch: ApiMatchResponse = {
                ...apiMatchRaw,
                match_id: this.safeStringConversion(apiMatchRaw.match_id),
            };
            if (apiMatch) {
                // Save/update basic info to DB if needed
                await this.saveMatchFromApi(apiMatch);
                return apiMatch;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(
                `API fetch failed for match ${matchId}, falling back to DB:`,
                errorMessage,
            );
        }

        // Fallback to database
        const dbMatch = await this.matchRepository.findOne({
            where: { match_id: matchId },
            relations: ['players', 'events', 'events.player', 'players.stats'],
        });

        if (dbMatch) {
            this.logger.log(`Match ${matchId} found in database`);
            // Transform DB data to match API format expected by frontend
            const transformed = this.transformDbMatchToApiFormat(dbMatch);
            return {
                ...transformed,
                id: String(transformed.id), // Ensure id is string for API compatibility
            } as ApiMatchResponse;
        }

        return null;
    }

    /**
     * Sync matches from API to database
     */
    async syncMatchesFromApi(
        leagueId: string = this.DEFAULT_LEAGUE_ID,
        seasonId: string = this.DEFAULT_SEASON_ID
    ): Promise<MatchSyncResult> {
        this.logger.log(`Starting sync for league ${leagueId}, season ${seasonId}`);

        try {
            const apiData = await this.api.fetchLeagueMatches(leagueId, seasonId);

            // Normalize API response with proper type checking
            const matches: ApiMatchResponse[] = this.normalizeApiResponse(apiData);

            this.logger.log(`Found ${matches.length} matches from API`);

            const savedMatches: Match[] = [];
            for (const match of matches) {
                try {
                    const saved = await this.saveMatchFromApi(match);
                    if (saved) {
                        savedMatches.push(saved);
                    }
                } catch (error) {
                    this.logger.error(
                        `Error saving match ${match.match_id || match.id}:`,
                        error.message,
                    );
                }
            }

            this.logger.log(
                `Successfully saved ${savedMatches.length} matches to database`,
            );
            return {
                synced: savedMatches.length,
                total: matches.length,
                matches: savedMatches,
            };
        } catch (error) {
            this.logger.error('Error syncing matches from API:', error.message);
            throw error;
        }
    }

    /**
     * Update existing matches with competition data from API
     */
    async updateExistingMatchesWithCompetition(): Promise<CompetitionUpdateResult> {
        this.logger.log('Updating existing matches with competition data');

        try {
            // Get all matches without competition data
            const matchesWithoutCompetition = await this.matchRepository.find({
                where: { competition: IsNull() },
            });

            this.logger.log(
                `Found ${matchesWithoutCompetition.length} matches without competition data`,
            );

            let updatedCount = 0;
            for (const match of matchesWithoutCompetition) {
                try {
                    // Try to fetch fresh data from API
                    const apiDataRaw = await this.api.fetchMatchDetails(match.match_id);
                    const apiData: ApiMatchResponse = {
                        ...apiDataRaw,
                        match_id: this.safeStringConversion(apiDataRaw.match_id),
                    };
                    if (apiData && (apiData.competition || apiData.league_name)) {
                        await this.matchRepository.update(match.id, {
                            competition: apiData.competition || apiData.league_name,
                        });
                        updatedCount++;
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    this.logger.warn(
                        `Could not update competition for match ${match.match_id}:`,
                        errorMessage,
                    );
                }
            }

            this.logger.log(`Updated ${updatedCount} matches with competition data`);
            return { updated: updatedCount, total: matchesWithoutCompetition.length };
        } catch (error) {
            this.logger.error(
                'Error updating matches with competition data:',
                error.message,
            );
            throw error;
        }
    }

    /**
     * Save or update match from API data with transaction support
     */
    private async saveMatchFromApi(
        apiMatch: ApiMatchResponse,
    ): Promise<Match | null> {
        return this.dataSource.transaction(async (manager) => {
            try {
                const matchId = this.extractMatchId(apiMatch);

                if (!matchId) {
                    this.logger.warn('Match has no ID, skipping');
                    return null;
                }

                // Check if match already exists
                const existing = await manager.findOne(Match, {
                    where: { match_id: matchId },
                });

                const matchData: CreateMatchDto = this.buildMatchDto(apiMatch, matchId);

                if (existing) {
                    // Update existing match
                    await manager.update(Match, existing.id, matchData);
                    return manager.findOne(Match, { where: { id: existing.id } });
                } else {
                    // Create new match
                    const newMatch = manager.create(Match, matchData);
                    return manager.save(Match, newMatch);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Error processing match:`, errorMessage);
                return null;
            }
        });
    }

    async createMatch(createMatchDto: CreateMatchDto): Promise<Match> {
        const match = this.matchRepository.create(createMatchDto);
        return this.matchRepository.save(match);
    }

    async updateMatch(
        id: number,
        updateData: Partial<CreateMatchDto>,
    ): Promise<Match | null> {
        await this.matchRepository.update(id, updateData);
        return this.matchRepository.findOne({ where: { id } });
    }

    async deleteMatch(id: number): Promise<void> {
        await this.matchRepository.delete(id);
    }

    async getMatchesCount(): Promise<number> {
        return this.matchRepository.count();
    }

    private calculateMinutesPlayed(
        playerInMatch: Player | undefined,
        playerEvents: MatchEvent[],
    ): number | null {
        /**
         * Calculates the minutes a player was on the field based on their events.
         * Starters enter at 0, subs enter at their first event minute.
         * Players exit on substitution or red card, or play full 90 minutes.
         */
        if (playerEvents.length === 0) return null;

        // Sort events by minute
        const sortedEvents = playerEvents.sort((a, b) => a.minute - b.minute);

        // Find entry time (first event or assume 0 for starters)
        const entryMinute = playerInMatch?.is_starter ? 0 : sortedEvents[0].minute;

        // Find exit time (substitution, red card, or full match)
        let exitMinute = this.FULL_MATCH_MINUTES;
        const exitEvents = sortedEvents.filter(
            (e) => e.event_type === 'substitution' || e.event_type === 'red_card',
        );
        if (exitEvents.length > 0) {
            exitMinute = Math.min(...exitEvents.map((e) => e.minute));
        }

        // Calculate minutes played
        return Math.max(0, exitMinute - entryMinute);
    }

    async getMatchesByPlayerId(playerId: string) {
        this.logger.log(`Fetching matches for player ID: ${playerId}`);

        // Find the player first
        const player = await this.matchRepository.manager.findOne(Player, {
            where: { player_id: playerId },
            relations: ['matches'],
        });

        if (!player) {
            this.logger.warn(`Player ${playerId} not found`);
            return [];
        }

        // Get matches with full details
        const matches = await this.matchRepository.find({
            where: { players: { player_id: playerId } },
            relations: ['players', 'events', 'events.player'],
            order: { match_date: 'DESC' },
        });

        // Transform to API format and include player-specific data
        return matches.map((match) => {
            const matchData = this.transformDbMatchToApiFormat(match);

            // Find this player's data in the match
            const playerInMatch = match.players.find((p) => p.player_id === playerId);
            const playerEvents = match.events.filter(
                (e) => e.player.player_id === playerId,
            );

            // Calculate minutes played based on events
            let minutesPlayed: number | null = null;
            if (playerEvents.length > 0) {
                minutesPlayed = this.calculateMinutesPlayed(
                    playerInMatch,
                    playerEvents,
                );
            }

            return {
                ...matchData,
                player_team:
                    playerInMatch?.team_id === match.home_team_id
                        ? match.home_team
                        : match.away_team,
                player_minutes: minutesPlayed,
                player_events: playerEvents.map((event) => ({
                    id: event.id,
                    event_type: event.event_type,
                    minute: event.minute,
                    start_minute: event.minute,
                    start_second: 0,
                    event_label:
                        event.event_type === 'goal'
                            ? 'Goal'
                            : event.event_type === 'yellow_card'
                                ? 'Yellow Card'
                                : event.event_type === 'red_card'
                                    ? 'Red Card'
                                    : event.event_type === 'substitution'
                                        ? 'Substitution'
                                        : 'Event',
                })),
            };
        });
    }

    private transformDbMatchToApiFormat(dbMatch: Match) {
        // Group players by team
        const homePlayers =
            dbMatch.players?.filter((p) => p.team_id === dbMatch.home_team_id) || [];
        const awayPlayers =
            dbMatch.players?.filter((p) => p.team_id === dbMatch.away_team_id) || [];

        // Transform players to API format
        const home_team_players = homePlayers.map((player) => ({
            id: player.player_id,
            player_id: player.player_id,
            fname: player.fname,
            lname: player.lname,
            number: player.shirt_number,
            position: player.position,
            is_sub: player.is_starter ? 0 : 1, // is_starter=true means starter (is_sub=0), false means sub (is_sub=1)
            team_id: player.team_id,
            events: [], // We'll populate this from match events
        }));

        const away_team_players = awayPlayers.map((player) => ({
            id: player.player_id,
            player_id: player.player_id,
            fname: player.fname,
            lname: player.lname,
            number: player.shirt_number,
            position: player.position,
            is_sub: player.is_starter ? 0 : 1, // is_starter=true means starter (is_sub=0), false means sub (is_sub=1)
            team_id: player.team_id,
            events: [], // We'll populate this from match events
        }));

        // Transform match events to API format
        const events =
            dbMatch.events?.map((event) => ({
                id: event.id,
                player_id: event.player.player_id, // Use external player_id, not database ID
                event_id: 0,
                start_minute: event.minute,
                start_second: 0,
                timestamp: event.minute * 60,
                event_type: event.event_type,
                event_label:
                    event.event_type === 'goal'
                        ? 'Goal'
                        : event.event_type === 'yellow_card'
                            ? 'Yellow Card'
                            : 'Event',
                good_bad: 'neutral',
            })) || [];

        return {
            id: dbMatch.id,
            match_id: dbMatch.match_id,
            home_team: dbMatch.home_team,
            away_team: dbMatch.away_team,
            home_score: dbMatch.home_score,
            away_score: dbMatch.away_score,
            match_date: dbMatch.match_date?.toISOString().split('T')[0],
            competition: dbMatch.competition,
            pxlt_game_id: dbMatch.pxlt_game_id,
            video_url: dbMatch.video_url, // Direct access to video_url
            home_team_players,
            away_team_players,
            events,
            video: dbMatch.video_url
                ? {
                    normal_hls: dbMatch.video_url,
                }
                : undefined,
        };
    }

    /**
     * Safely convert value to string, handling null/undefined cases
     */
    private safeStringConversion(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value);
    }

    /**
     * Extract match ID from API response with fallbacks
     */
    private extractMatchId(apiMatch: ApiMatchResponse): string | null {
        return apiMatch.match_id || apiMatch.id || null;
    }

    /**
     * Build CreateMatchDto from API response
     */
    private buildMatchDto(apiMatch: ApiMatchResponse, matchId: string): CreateMatchDto {
        return {
            match_id: matchId,
            home_team: apiMatch.home_team || apiMatch.home_label || '',
            away_team: apiMatch.away_team || apiMatch.away_label || '',
            home_team_id: this.safeStringConversion(apiMatch.home_team_id || apiMatch.home_id),
            away_team_id: this.safeStringConversion(apiMatch.away_team_id || apiMatch.away_id),
            home_score: apiMatch.home_score || apiMatch.home_team_score,
            away_score: apiMatch.away_score || apiMatch.away_team_score,
            match_date: apiMatch.match_date || apiMatch.date,
            competition: apiMatch.competition || apiMatch.league_name,
            league: apiMatch.league || apiMatch.league_id,
            status: apiMatch.status || apiMatch.match_status,
            venue: apiMatch.venue || apiMatch.stadium,
            home_formation: apiMatch.home_formation || apiMatch.home_team_formation,
            away_formation: apiMatch.away_formation || apiMatch.away_team_formation,
            match_events: apiMatch.events || apiMatch.match_events,
            statistics: apiMatch.statistics || apiMatch.stats,
        };
    }

    /**
     * Normalize API response to consistent format
     */
    private normalizeApiResponse(apiData: any): ApiMatchResponse[] {
        if (Array.isArray(apiData)) {
            return apiData;
        }

        if (hasDataProperty(apiData)) {
            return apiData.data;
        }

        if (Array.isArray(apiData?.matches)) {
            return apiData.matches.map((match: any) => ({
                match_id: match.game_id,
                home_team: match.team_a_name,
                away_team: match.team_b_name,
                match_date: match.date,
                home_team_id: match.team_a_id,
                away_team_id: match.team_b_id,
                competition: match.fixture_name,
                venue: match.stadium_name,
                // Add more mappings as needed
            }));
        }

        return [];
    }
}
