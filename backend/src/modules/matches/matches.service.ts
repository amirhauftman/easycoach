import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EasyCoachApiService } from './easycoach-api.service';
import { Match } from './entities/match.entity';
import { Player } from '../players/entities/player.entity';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchesService {
    private readonly logger = new Logger(MatchesService.name);

    constructor(
        @InjectRepository(Match)
        private readonly matchRepository: Repository<Match>,
        private readonly api: EasyCoachApiService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

    async getMatchById(matchId: string) {
        this.logger.log(`Fetching match with ID: ${matchId}`);

        // For match details, always try API first since DB doesn't have player data
        try {
            this.logger.log(`Fetching detailed match ${matchId} from API`);
            const apiMatch = await this.api.fetchMatchDetails(matchId);
            if (apiMatch) {
                // Save/update basic info to DB if needed
                await this.saveMatchFromApi(apiMatch);
                return apiMatch;
            }
        } catch (error) {
            this.logger.warn(`API fetch failed for match ${matchId}, falling back to DB:`, error.message);
        }

        // Fallback to database
        const dbMatch = await this.matchRepository.findOne({
            where: { match_id: matchId },
            relations: ['players', 'events', 'events.player', 'players.stats'],
        });

        if (dbMatch) {
            this.logger.log(`Match ${matchId} found in database`);
            // Transform DB data to match API format expected by frontend
            return this.transformDbMatchToApiFormat(dbMatch);
        }

        return null;
    }

    async syncMatchesFromApi(leagueId: string = '726', seasonId: string = '25') {
        this.logger.log(`Starting sync for league ${leagueId}, season ${seasonId}`);

        try {
            const apiData = await this.api.fetchLeagueMatches(leagueId, seasonId);

            // Normalize API response
            const matches: any[] = Array.isArray(apiData)
                ? apiData
                : Array.isArray(apiData?.data)
                    ? apiData.data
                    : Array.isArray(apiData?.matches)
                        ? apiData.matches
                        : [];

            this.logger.log(`Found ${matches.length} matches from API`);

            const savedMatches: Match[] = [];
            for (const match of matches) {
                try {
                    const saved = await this.saveMatchFromApi(match);
                    if (saved) {
                        savedMatches.push(saved);
                    }
                } catch (error) {
                    this.logger.error(`Error saving match ${match.match_id || match.id}:`, error.message);
                }
            }

            this.logger.log(`Successfully saved ${savedMatches.length} matches to database`);
            return {
                synced: savedMatches.length,
                total: matches.length,
                matches: savedMatches
            };
        } catch (error) {
            this.logger.error('Error syncing matches from API:', error.message);
            throw error;
        }
    }

    async updateExistingMatchesWithCompetition() {
        this.logger.log('Updating existing matches with competition data');

        try {
            // Get all matches without competition data
            const matchesWithoutCompetition = await this.matchRepository.find({
                where: { competition: IsNull() },
            });

            this.logger.log(`Found ${matchesWithoutCompetition.length} matches without competition data`);

            let updatedCount = 0;
            for (const match of matchesWithoutCompetition) {
                try {
                    // Try to fetch fresh data from API
                    const apiData = await this.api.fetchMatchDetails(match.match_id);
                    if (apiData && (apiData.competition || apiData.league_name)) {
                        await this.matchRepository.update(match.id, {
                            competition: apiData.competition || apiData.league_name
                        });
                        updatedCount++;
                    }
                } catch (error) {
                    this.logger.warn(`Could not update competition for match ${match.match_id}:`, error.message);
                }
            }

            this.logger.log(`Updated ${updatedCount} matches with competition data`);
            return { updated: updatedCount, total: matchesWithoutCompetition.length };
        } catch (error) {
            this.logger.error('Error updating matches with competition data:', error.message);
            throw error;
        }
    }

    private async saveMatchFromApi(apiMatch: any): Promise<Match | null> {
        try {
            const matchId = apiMatch.match_id || apiMatch.id || String(apiMatch.match_id);

            if (!matchId) {
                this.logger.warn('Match has no ID, skipping');
                return null;
            }

            // Check if match already exists
            const existing = await this.matchRepository.findOne({
                where: { match_id: matchId },
            });

            const matchData: CreateMatchDto = {
                match_id: matchId,
                home_team: apiMatch.home_team || apiMatch.home_label || '',
                away_team: apiMatch.away_team || apiMatch.away_label || '',
                home_team_id: apiMatch.home_team_id || apiMatch.home_id,
                away_team_id: apiMatch.away_team_id || apiMatch.away_id,
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

            if (existing) {
                // Update existing match
                await this.matchRepository.update(existing.id, matchData);
                return this.matchRepository.findOne({ where: { id: existing.id } });
            } else {
                // Create new match
                const newMatch = this.matchRepository.create(matchData);
                return this.matchRepository.save(newMatch);
            }
        } catch (error) {
            this.logger.error(`Error processing match:`, error.message);
            return null;
        }
    }

    async createMatch(createMatchDto: CreateMatchDto): Promise<Match> {
        const match = this.matchRepository.create(createMatchDto);
        return this.matchRepository.save(match);
    }

    async updateMatch(id: number, updateData: Partial<CreateMatchDto>): Promise<Match | null> {
        await this.matchRepository.update(id, updateData);
        return this.matchRepository.findOne({ where: { id } });
    }

    async deleteMatch(id: number): Promise<void> {
        await this.matchRepository.delete(id);
    }

    async getMatchesCount(): Promise<number> {
        return this.matchRepository.count();
    }

    async getMatchesByPlayerId(playerId: string) {
        this.logger.log(`Fetching matches for player ID: ${playerId}`);

        // Find the player first
        const player = await this.matchRepository.manager.findOne(Player, {
            where: { player_id: playerId },
            relations: ['matches']
        });

        if (!player) {
            this.logger.warn(`Player ${playerId} not found`);
            return [];
        }

        // Get matches with full details
        const matches = await this.matchRepository.find({
            where: { players: { player_id: playerId } },
            relations: ['players', 'events', 'events.player'],
            order: { match_date: 'DESC' }
        });

        // Transform to API format and include player-specific data
        return matches.map(match => {
            const matchData = this.transformDbMatchToApiFormat(match);

            // Find this player's data in the match
            const playerInMatch = match.players.find(p => p.player_id === playerId);
            const playerEvents = match.events.filter(e => e.player.player_id === playerId);

            // Calculate minutes played based on events
            let minutesPlayed: number | null = null;
            if (playerEvents.length > 0) {
                // Sort events by minute
                const sortedEvents = playerEvents.sort((a, b) => a.minute - b.minute);

                // Find entry time (first event or assume 0 for starters)
                const entryMinute = playerInMatch?.is_starter ? 0 : sortedEvents[0].minute;

                // Find exit time (substitution, red card, or 90)
                let exitMinute = 90; // Default to full match
                const exitEvents = sortedEvents.filter(e =>
                    e.event_type === 'substitution' || e.event_type === 'red_card'
                );
                if (exitEvents.length > 0) {
                    exitMinute = Math.min(...exitEvents.map(e => e.minute));
                }

                // Calculate minutes played
                minutesPlayed = Math.max(0, exitMinute - entryMinute);
            }

            return {
                ...matchData,
                player_team: playerInMatch?.team_id === match.home_team_id ? match.home_team : match.away_team,
                player_minutes: minutesPlayed,
                player_events: playerEvents.map(event => ({
                    id: event.id,
                    event_type: event.event_type,
                    minute: event.minute,
                    start_minute: event.minute,
                    start_second: 0,
                    event_label: event.event_type === 'goal' ? 'Goal' :
                        event.event_type === 'yellow_card' ? 'Yellow Card' :
                            event.event_type === 'red_card' ? 'Red Card' :
                                event.event_type === 'substitution' ? 'Substitution' : 'Event'
                }))
            };
        });
    }

    private transformDbMatchToApiFormat(dbMatch: Match) {
        // Group players by team
        const homePlayers = dbMatch.players?.filter(p => p.team_id === dbMatch.home_team_id) || [];
        const awayPlayers = dbMatch.players?.filter(p => p.team_id === dbMatch.away_team_id) || [];

        // Transform players to API format
        const home_team_players = homePlayers.map(player => ({
            id: player.player_id,
            player_id: player.player_id,
            fname: player.fname,
            lname: player.lname,
            number: player.shirt_number,
            position: player.position,
            is_sub: player.is_starter ? 0 : 1, // is_starter=true means starter (is_sub=0), false means sub (is_sub=1)
            team_id: player.team_id,
            events: [] // We'll populate this from match events
        }));

        const away_team_players = awayPlayers.map(player => ({
            id: player.player_id,
            player_id: player.player_id,
            fname: player.fname,
            lname: player.lname,
            number: player.shirt_number,
            position: player.position,
            is_sub: player.is_starter ? 0 : 1, // is_starter=true means starter (is_sub=0), false means sub (is_sub=1)
            team_id: player.team_id,
            events: [] // We'll populate this from match events
        }));

        // Transform match events to API format
        const events = dbMatch.events?.map(event => ({
            id: event.id,
            player_id: event.player.player_id, // Use external player_id, not database ID
            event_id: 0,
            start_minute: event.minute,
            start_second: 0,
            timestamp: event.minute * 60,
            event_type: event.event_type,
            event_label: event.event_type === 'goal' ? 'Goal' : event.event_type === 'yellow_card' ? 'Yellow Card' : 'Event',
            good_bad: 'neutral'
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
            video: dbMatch.video_url ? {
                normal_hls: dbMatch.video_url
            } : undefined
        };
    }
}
