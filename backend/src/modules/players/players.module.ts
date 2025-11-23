import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { EasyCoachPlayersApiService } from './easycoach-players-api.service';
import { Player } from './entities/player.entity';
import { PlayerStat } from './entities/player-stat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, PlayerStat]),
    HttpModule
  ],
  controllers: [PlayersController],
  providers: [PlayersService, EasyCoachPlayersApiService],
  exports: [PlayersService],
})
export class PlayersModule { }
