import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import configuration from './config/configuration';
import { createTypeOrmOptions } from './config/typeorm.config';
import { MatchesModule } from './modules/matches/matches.module';
import { PlayersModule } from './modules/players/players.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const shouldUseTypeOrm = !!process.env.DATABASE_HOST;
const typeOrmImport = shouldUseTypeOrm
  ? [
      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => createTypeOrmOptions(config),
      }),
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ...typeOrmImport,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ttl: config.get('cache.ttl') ?? 300,
        max: 100,
      }),
    }),
    HttpModule.register({ timeout: 10000 }),
    MatchesModule,
    PlayersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
