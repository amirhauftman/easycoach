import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { EasyCoachApiService } from './easycoach-api.service';

@Module({
  imports: [HttpModule],
  controllers: [MatchesController],
  providers: [MatchesService, EasyCoachApiService],
  exports: [MatchesService],
})
export class MatchesModule {}
