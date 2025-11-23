// Shared types for the application

export interface ApiMatch {
    game_id: string;
    id?: string | number;
    match_id?: string;
    home_team: string;
    away_team: string;
    home_score?: number;
    away_score?: number;
    kickoff: string;
    competition?: string;
    status?: string;
    match_date: string;
    home_team_id: string;
    away_team_id: string;
    pxlt_game_id?: string;
    season_name?: string;
}

export interface ApiMatchDetail {
    game_id?: string;
    id?: string | number;
    match_id?: string;
    home_team: string;
    away_team: string;
    home_score: number;
    away_score: number;
    match_date: string;
    pxlt_game_id?: string;
    video_url?: string; // Direct access to video URL from database
    home_team_players: ApiPlayer[];
    away_team_players: ApiPlayer[];
    events?: ApiEvent[];
    home_team_formation?: string;
    away_team_formation?: string;
    video?: {
        normal_hls?: string;
        pano_hls?: string;
    };
}

export interface ApiPlayer {
    id: string | number;
    player_id: string;
    fname: string;
    lname: string;
    number: number | string;
    position?: string;
    is_sub: number;
    team_id: string;
    game_time?: number;
    events?: {
        goals?: ApiEvent[];
        yellows?: ApiEvent[];
        reds?: ApiEvent[];
    };
}

export interface ApiEvent {
    id?: string | number;
    player_id: string | number;
    event_id: number;
    start_minute: number;
    start_second: number;
    timestamp?: number;
    event_type?: string;
    event_label?: string;
    good_bad?: string;
}

export interface PixellotEventDetails {
    eventId: string;
    name: string;
    status: string;
    liveHdHlsUrl?: string;
    cloudRecordedHdHlsUrl?: string;
    cloudRecordedHdMp4Url?: string;
    startDate: string;
    endDate: string;
}

// Component types
export interface Player {
    id: string | number;
    name: string;
    shirt_number?: string | number;
    position?: string;
}

export interface Lineup {
    starters: Player[];
    subs: Player[];
}

export interface Event {
    minute: number;
    type: string;
    timestamp?: number;
    player?: Player;
}