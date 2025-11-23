/**
 * Interface for standardized match response format used internally
 * Maps various API response formats to a consistent structure
 */
export interface ApiMatchResponse {
    match_id?: string;
    id?: string;
    home_team?: string;
    home_label?: string;
    away_team?: string;
    away_label?: string;
    home_team_id?: string | number;
    home_id?: string | number;
    away_team_id?: string | number;
    away_id?: string | number;
    home_score?: number;
    home_team_score?: number;
    away_score?: number;
    away_team_score?: number;
    match_date?: string;
    date?: string;
    competition?: string;
    league_name?: string;
    league?: string;
    league_id?: string;
    status?: string;
    match_status?: string;
    venue?: string;
    stadium?: string;
    home_formation?: string;
    home_team_formation?: string;
    away_formation?: string;
    away_team_formation?: string;
    events?: any[];
    match_events?: any[];
    statistics?: any;
    stats?: any;
    video?: { normal_hls?: string };
    pxlt_game_id?: string;
    teams?: Array<{
        team_id: string;
        team_name_english?: string;
        goals?: number;
        players?: Array<{
            player_id: string;
            player_name_en?: string;
            shirt_number?: number;
            goalkeeper?: string;
            main?: string;
            events?: any;
        }>;
    }>;
    time?: string;
}

/**
 * Type guard to check if object has a data property with array
 */
export function hasDataProperty(obj: any): obj is { data: ApiMatchResponse[] } {
    return obj && typeof obj === 'object' && Array.isArray(obj.data);
}

/**
 * Sync result for match operations
 */
export interface MatchSyncResult {
    synced: number;
    total: number;
    matches: any[];
}

/**
 * Competition update result
 */
export interface CompetitionUpdateResult {
    updated: number;
    total: number;
}