import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { EasyCoachApiService } from './easycoach-api.service';
import { Match } from './entities/match.entity';
import { MatchEvent } from './entities/match-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchEvent]), HttpModule],
  controllers: [MatchesController],
  providers: [MatchesService, EasyCoachApiService],
  exports: [MatchesService],
})
export class MatchesModule {}
