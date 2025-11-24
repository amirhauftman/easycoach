import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdatePlayerStatsDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    passing?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    dribbling?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    speed?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    strength?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    vision?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    defending?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    shooting?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    potential?: number;

    constructor(apiPlayer?: any) {
        if (apiPlayer) {
            this.passing = this.parseStat(apiPlayer.passing) ?? this.parseStat(apiPlayer.stats?.passing);
            this.dribbling = this.parseStat(apiPlayer.dribbling) ?? this.parseStat(apiPlayer.stats?.dribbling);
            this.speed = this.parseStat(apiPlayer.speed) ?? this.parseStat(apiPlayer.stats?.speed);
            this.strength = this.parseStat(apiPlayer.strength) ?? this.parseStat(apiPlayer.stats?.strength);
            this.vision = this.parseStat(apiPlayer.vision) ?? this.parseStat(apiPlayer.stats?.vision);
            this.defending = this.parseStat(apiPlayer.defending) ?? this.parseStat(apiPlayer.stats?.defending);
            this.shooting = this.parseStat(apiPlayer.shooting) ?? this.parseStat(apiPlayer.stats?.shooting);
            this.potential = this.parseStat(apiPlayer.potential) ?? this.parseStat(apiPlayer.stats?.potential);
        }
    }

    private parseStat(value: number | string | undefined): number | undefined {
        if (value === undefined || value === null) return undefined;
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        return isNaN(num) ? undefined : num;
    }
}