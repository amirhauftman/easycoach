import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) { }

  async getPlayers(teamId?: string) {
    // Get players from database only
    const players = await this.playerRepository.find({
      where: teamId ? { team_id: teamId } : {},
      relations: ['stats'],
    });

    return { data: players, meta: { count: players.length } };
  }

  async getPlayerById(id: string) {
    let player = await this.playerRepository.findOne({
      where: { player_id: id },
      relations: ['stats', 'matches', 'events'],
    });

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

  async updatePlayerStats(playerId: string, statsData: Partial<UpdatePlayerStatsDto>) {
    // Find player by external player_id
    const player = await this.playerRepository.findOne({
      where: { player_id: playerId },
      relations: ['stats'],
    });

    if (!player) {
      return null;
    }

    // Update or create stats
    await this.savePlayerStats(player.id, statsData as UpdatePlayerStatsDto);

    // Return updated player with stats
    return this.playerRepository.findOne({
      where: { player_id: playerId },
      relations: ['stats'],
    });
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
