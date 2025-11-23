import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MatchesService } from '../src/modules/matches/matches.service';
import { Match } from '../src/modules/matches/entities/match.entity';
import { Player } from '../src/modules/players/entities/player.entity';
import { PlayerStat } from '../src/modules/players/entities/player-stat.entity';
import { MatchEvent } from '../src/modules/matches/entities/match-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

class EnrichMatchesScript {
    private matchesService: MatchesService;
    private matchRepository: Repository<Match>;
    private playerRepository: Repository<Player>;
    private playerStatRepository: Repository<PlayerStat>;
    private matchEventRepository: Repository<MatchEvent>;

    constructor(
        matchesService: MatchesService,
        matchRepository: Repository<Match>,
        playerRepository: Repository<Player>,
        playerStatRepository: Repository<PlayerStat>,
        matchEventRepository: Repository<MatchEvent>
    ) {
        this.matchesService = matchesService;
        this.matchRepository = matchRepository;
        this.playerRepository = playerRepository;
        this.playerStatRepository = playerStatRepository;
        this.matchEventRepository = matchEventRepository;
    }

    async run() {
        console.log('Starting match enrichment script...');

        // Get all matches from database
        const matches = await this.matchRepository.find();
        console.log(`Found ${matches.length} matches to enrich`);

        let successCount = 0;
        let errorCount = 0;

        for (const match of matches) {
            try {
                console.log(`Processing match ${match.match_id}...`);
                await this.enrichMatch(match);
                successCount++;
                console.log(`Successfully enriched match ${match.match_id}`);
            } catch (error) {
                console.error(`Error enriching match ${match.match_id}:`, error.message);
                errorCount++;
            }

            // Add a small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`Script completed. Success: ${successCount}, Errors: ${errorCount}`);
    }

    private async enrichMatch(match: Match) {
        const url = `https://ifa.easycoach.club/en/api/v3/analytics/match?match_id=${match.match_id}&user_token=YZ3p3MUqQV3KArSSqOrz8SwEIfyFRxRe`;

        try {
            const response = await axios.get(url);
            const data = response.data;

            if (data.status === 'ok' && data.match_details) {
                // Update match with video URL
                if (data.match_details.video?.normal_hls) {
                    match.video_url = data.match_details.video.normal_hls;
                    await this.matchRepository.save(match);
                }

                // Update match with Pixellot game ID if available
                if (data.pxlt_game_id) {
                    match.pxlt_game_id = data.pxlt_game_id;
                    await this.matchRepository.save(match);
                }

                // Process teams and players
                if (data.teams && Array.isArray(data.teams)) {
                    for (const team of data.teams) {
                        if (team.players && Array.isArray(team.players)) {
                            for (const playerData of team.players) {
                                await this.createOrUpdatePlayer(match, team.team_id, playerData);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`API call failed for match ${match.match_id}:`, error.message);
            throw error;
        }
    }

    private async createOrUpdatePlayer(match: Match, teamId: string, playerData: any) {
        const playerId = playerData.player_id.toString();

        // Check if player already exists
        let player = await this.playerRepository.findOne({
            where: { player_id: playerId }
        });

        if (!player) {
            // Parse player name
            const nameParts = playerData.player_name_en?.split(' ') || [];
            const fname = nameParts.slice(0, -1).join(' ') || '';
            const lname = nameParts[nameParts.length - 1] || '';

            // Create new player
            player = this.playerRepository.create({
                player_id: playerId,
                team_id: teamId,
                fname: fname,
                lname: lname,
                shirt_number: parseInt(playerData.shirt_number) || undefined,
                position: playerData.goalkeeper === '1' ? 'GK' : 'FW', // Default to FW if not GK
                is_starter: playerData.main === '1'
            });

            player = await this.playerRepository.save(player);

            // Create mock stats for the player
            await this.createMockStats(player);
        } else {
            // Update existing player with starter status and position
            player.is_starter = playerData.main === '1';
            player.position = playerData.goalkeeper === '1' ? 'GK' : 'FW';
            player = await this.playerRepository.save(player);
        }

        // Add player to match (many-to-many relationship)
        if (!match.players) {
            match.players = [];
        }
        if (!match.players.some(p => p.id === player.id)) {
            match.players.push(player);
            await this.matchRepository.save(match);
        }

        // Create mock events for this player in this match
        await this.createMockEvents(match, player);
    }

    private async createMockStats(player: Player) {
        const stat = this.playerStatRepository.create({
            player: player,
            player_id: player.id,
            passing: Math.floor(Math.random() * 10) + 1,
            dribbling: Math.floor(Math.random() * 10) + 1,
            speed: Math.floor(Math.random() * 10) + 1,
            strength: Math.floor(Math.random() * 10) + 1,
            vision: Math.floor(Math.random() * 10) + 1,
            defending: Math.floor(Math.random() * 10) + 1,
            shooting: Math.floor(Math.random() * 10) + 1,
            potential: Math.floor(Math.random() * 10) + 1
        });
        await this.playerStatRepository.save(stat);
    }

    private async createMockEvents(match: Match, player: Player) {
        // Randomly decide if player has events (30% chance)
        if (Math.random() < 0.3) {
            const eventTypes = ['goal', 'yellow_card'];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const minute = Math.floor(Math.random() * 90) + 1; // Random minute 1-90

            const event = this.matchEventRepository.create({
                match: match,
                match_id: match.id,
                player: player,
                player_id: player.id,
                event_type: eventType,
                minute: minute
            });
            await this.matchEventRepository.save(event);
        }
    }
}

async function main() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const matchesService = app.get(MatchesService);
    const matchRepository = app.get('MatchRepository') as Repository<Match>;
    const playerRepository = app.get('PlayerRepository') as Repository<Player>;
    const playerStatRepository = app.get('PlayerStatRepository') as Repository<PlayerStat>;
    const matchEventRepository = app.get('MatchEventRepository') as Repository<MatchEvent>;

    const script = new EnrichMatchesScript(
        matchesService,
        matchRepository,
        playerRepository,
        playerStatRepository,
        matchEventRepository
    );

    try {
        await script.run();
    } catch (error) {
        console.error('Script failed:', error);
    } finally {
        await app.close();
    }
}

main().catch(console.error);