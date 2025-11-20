import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { EasyCoachPlayersApiService } from './easycoach-players-api.service';

@Module({
  imports: [HttpModule],
  controllers: [PlayersController],
  providers: [PlayersService, EasyCoachPlayersApiService],
  exports: [PlayersService],
})
export class PlayersModule {}
