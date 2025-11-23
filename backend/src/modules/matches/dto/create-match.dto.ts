import { IsString, IsOptional, IsNumber, IsDateString, IsObject } from 'class-validator';

export class CreateMatchDto {
    @IsString()
    match_id: string;

    @IsString()
    home_team: string;

    @IsString()
    away_team: string;

    @IsOptional()
    @IsString()
    home_team_id?: string;

    @IsOptional()
    @IsString()
    away_team_id?: string;

    @IsOptional()
    @IsNumber()
    home_score?: number;

    @IsOptional()
    @IsNumber()
    away_score?: number;

    @IsOptional()
    @IsDateString()
    match_date?: string;

    @IsOptional()
    @IsString()
    competition?: string;

    @IsOptional()
    @IsString()
    league?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    venue?: string;

    @IsOptional()
    @IsString()
    pxlt_game_id?: string;

    @IsOptional()
    @IsString()
    season_name?: string;

    @IsOptional()
    @IsObject()
    home_formation?: any;

    @IsOptional()
    @IsObject()
    away_formation?: any;

    @IsOptional()
    @IsObject()
    match_events?: any;

    @IsOptional()
    @IsObject()
    statistics?: any;
}
