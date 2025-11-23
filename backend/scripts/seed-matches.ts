import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MatchesService } from '../src/modules/matches/matches.service';
import { CreateMatchDto } from '../src/modules/matches/dto/create-match.dto';
import * as fs from 'fs';
import * as path from 'path';

async function seedMatches() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const matchesService = app.get(MatchesService);

    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../frontend/public/data/matches.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(jsonData);

    if (data.status === 'ok' && data.matches) {
        for (const matchData of data.matches) {
            const resultParts = matchData.result.split('-');
            // Parse date
            let matchDate: Date | null = null;
            if (matchData.date && matchData.hour) {
                const [day, month, year] = matchData.date.split('/').map(Number);
                const [hour, minute] = matchData.hour.split(':').map(Number);
                matchDate = new Date(2000 + year, month - 1, day, hour, minute);
            }
            const createMatchDto: CreateMatchDto = {
                match_id: matchData.game_id,
                home_team: matchData.team_a_name,
                away_team: matchData.team_b_name,
                home_team_id: matchData.team_a_id,
                away_team_id: matchData.team_b_id,
                home_score: parseInt(resultParts[0]),
                away_score: parseInt(resultParts[1]),
                match_date: matchDate ? matchDate.toISOString() : undefined,
                competition: matchData.fixture_name,
                league: matchData.fixture_name,
                venue: matchData.stadium_name,
                pxlt_game_id: matchData.pxlt_game_id,
                season_name: matchData.season_name,
                status: matchData.breakdown ? 'completed' : 'scheduled',
            };

            try {
                await matchesService.createMatch(createMatchDto);
                console.log(`Inserted match ${createMatchDto.match_id}`);
            } catch (error) {
                console.error(`Error inserting match ${createMatchDto.match_id}:`, error);
            }
        }
    }

    await app.close();
}

seedMatches().catch(console.error);