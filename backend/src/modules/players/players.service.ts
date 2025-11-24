import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EasyCoachPlayersApiService } from './easycoach-players-api.service';
import { Player } from './entities/player.entity';
import { PlayerStat } from './entities/player-stat.entity';
import { UpdatePlayerStatsDto } from './dto/update-player-stats.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(PlayerStat)
    private readonly playerStatRepository: Repository<PlayerStat>,
    private readonly api: EasyCoachPlayersApiService,
  ) { }

  async getPlayers(teamId?: string) {
    // Try to get from database first
    let players = await this.playerRepository.find({
      where: teamId ? { team_id: teamId } : {},
      relations: ['stats'],
    });

    // If no players in DB, fetch from API and save
    if (players.length === 0) {
      const data = await this.api.fetchPlayers(teamId);
      const list: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      // Save players to database
      for (const playerData of list) {
        await this.savePlayerFromApi(playerData);
      }

      // Fetch again from DB
      players = await this.playerRepository.find({
        where: teamId ? { team_id: teamId } : {},
        relations: ['stats'],
      });
    }

    return { data: players, meta: { count: players.length } };
  }

  async getPlayerById(id: string) {
    // Try to get from database first
    let player = await this.playerRepository.findOne({
      where: { player_id: id },
      relations: ['stats', 'matches', 'events'],
    });

    // If not in DB, fetch from API and save
    if (!player) {
      const apiData = await this.api.fetchPlayerDetails(id);
      if (apiData) {
        player = await this.savePlayerFromApi(apiData);
        // Fetch again with relations
        player = await this.playerRepository.findOne({
          where: { player_id: id },
          relations: ['stats', 'matches', 'events'],
        });
      }
    }

    // Add team name from matches if available
    if (player && player.matches && player.matches.length > 0) {
      // Sort matches by date to get the most recent
      const sortedMatches = player.matches.sort(
        (a, b) =>
          new Date(b.match_date).getTime() - new Date(a.match_date).getTime(),
      );
      const latestMatch = sortedMatches[0];
      (player as any).team_label =
        player.team_id === latestMatch.home_team_id
          ? latestMatch.home_team
          : latestMatch.away_team;
    }

    return player;
  }

  async getPlayerMatches(playerId: string) {
    const player = await this.playerRepository.findOne({
      where: { player_id: playerId },
      relations: ['matches', 'matches.events'],
    });

    if (!player) return [];

    return player.matches.map((match) => ({
      ...match,
      player_events: match.events.filter(
        (event) => event.player_id === player.id,
      ),
    }));
  }

  private async savePlayerFromApi(apiPlayer: any): Promise<Player | null> {
    const playerId =
      apiPlayer.player_id || apiPlayer.id || String(apiPlayer.id);

    if (!playerId) return null;

    // Check if player already exists
    const existing = await this.playerRepository.findOne({
      where: { player_id: playerId },
    });

    const playerData = {
      player_id: playerId,
      team_id: apiPlayer.team_id || apiPlayer.team?.id || '',
      fname:
        apiPlayer.fname ||
        apiPlayer.first_name ||
        apiPlayer.name?.split(' ')[0] ||
        '',
      lname:
        apiPlayer.lname ||
        apiPlayer.last_name ||
        apiPlayer.name?.split(' ').slice(1).join(' ') ||
        '',
      shirt_number: apiPlayer.shirt_number || apiPlayer.number,
      position: apiPlayer.position || apiPlayer.team_position,
      is_starter:
        apiPlayer.is_starter !== undefined ? apiPlayer.is_starter : true,
    };

    let player: Player;
    if (existing) {
      await this.playerRepository.update(existing.id, playerData);
      const updatedPlayer = await this.playerRepository.findOne({
        where: { id: existing.id },
      });
      if (!updatedPlayer) throw new Error('Failed to update player');
      player = updatedPlayer;
    } else {
      player = this.playerRepository.create(playerData);
      player = await this.playerRepository.save(player);
    }

    // Save/update player stats if available
    if (apiPlayer.stats || apiPlayer.passing || apiPlayer.dribbling) {
      const statsDto = new UpdatePlayerStatsDto(apiPlayer);
      await this.savePlayerStats(player.id, statsDto);
    }

    return player;
  }

  private async savePlayerStats(playerId: number, statsData: UpdatePlayerStatsDto) {
    const existingStats = await this.playerStatRepository.findOne({
      where: { player_id: playerId },
    });

    if (existingStats) {
      await this.playerStatRepository.update(existingStats.id, statsData);
    } else {
      const newStats = this.playerStatRepository.create({
        player_id: playerId,
        ...statsData,
      });
      await this.playerStatRepository.save(newStats);
    }
  }
}
