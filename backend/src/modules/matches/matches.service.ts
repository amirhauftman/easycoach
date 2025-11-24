import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { Player } from '../players/entities/player.entity';
import { MatchEvent } from './entities/match-event.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { ApiMatchResponse } from './interfaces/api-match.interfaces';

@Injectable()
export class MatchesService {
    private readonly logger = new Logger(MatchesService.name);
    private readonly FULL_MATCH_MINUTES = 90;

    constructor(
        @InjectRepository(Match)
        private readonly matchRepository: Repository<Match>,
    ) { }

    async getAllMatches() {
        this.logger.log('Fetching all matches from database');
        const matches = await this.matchRepository.find({
            order: { match_date: 'DESC' },
        });

        return matches;
    }

    /**
     * Fetch match details by ID from database only
     */
    async getMatchById(matchId: string): Promise<ApiMatchResponse | null> {

        const dbMatch = await this.matchRepository.findOne({
            where: { match_id: matchId },
            relations: ['players', 'events', 'events.player', 'players.stats'],
        });

        if (dbMatch) {
            // Transform DB data to match API format expected by frontend
            const transformed = this.transformDbMatchToApiFormat(dbMatch);
            return {
                ...transformed,
                id: String(transformed.id), // Ensure id is string for API compatibility
            } as ApiMatchResponse;
        }

        return null;
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


}
