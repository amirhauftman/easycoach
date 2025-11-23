export interface LeagueMatchesResponse {
  status: string;
  matches: Match[];
}

export interface Match {
  game_id: string;
  pxlt_game_id: string;
  season_name: string;
  age_code: string;
  fixture_name: string;
  fixture_name_en: string[];
  cycle_id: string;
  cycle_name: string;
  cycle_name_en: string;
  round_id: string;
  round_name: string;
  round_name_en: string;
  date: string;
  team_a_id: string;
  team_a_name: string;
  team_a_name_short: string;
  team_a_name_en: string;
  team_a_logo: string;
  team_b_id: string;
  team_b_name: string;
  team_b_name_short: string;
  team_b_name_en: string;
  team_b_logo: string;
  day_of_week: string;
  day_of_week_en: string;
  hour: string;
  stadium_id: string;
  stadium_name: string;
  stadium_name_en: string;
  st_addr_city: string;
  st_addr_street: string;
  st_addr_house: string;
  tv: string[];
  tv_en: string[];
  result: string;
  result_en: string;
  referee: Referee[];
  // Add more fields as needed
}

export interface Referee {
  ref_id: string;
  ref_name: string;
  role_id: string;
  role_desc: string;
}

export interface MatchDetailsResponse {
  match_id: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  match_date: string;
  home_team_players: Player[];
  away_team_players: Player[];
  // Add more fields as needed
}

export interface Player {
  player_id: string;
  fname: string;
  lname: string;
  number: number;
  position: string;
  events: Event[];
}

export interface Event {
  id: number;
  event_label: string;
  timestamp: number;
  start_minute: number;
  start_second: number;
  good_bad: string;
}
