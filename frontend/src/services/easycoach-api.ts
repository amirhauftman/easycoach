// EasyCoach API service functions
const API_BASE_URL = 'https://ifa.easycoach.club/en/api/v3/analytics';
const USER_TOKEN = 'YZ3p3MUqQV3KArSSqOrz8SwEIfyFRxRe';
const LEAGUE_ID = '726';
const SEASON_ID = '26';

// Types for API responses
export interface ApiMatch {
    match_id: string;
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
}

export interface ApiMatchDetail {
    match_id: string;
    home_team: string;
    away_team: string;
    home_score: number;
    away_score: number;
    match_date: string;
    pixellot_id?: string;
    home_team_players: ApiPlayer[];
    away_team_players: ApiPlayer[];
    events?: ApiEvent[];
    home_team_formation?: string;
    away_team_formation?: string;
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

// API service class
class EasyCoachAPI {
    private async fetchWithErrorHandling(url: string): Promise<any> {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async fetchMatches(): Promise<ApiMatch[]> {
        const url = `${API_BASE_URL}/league?league_id=${LEAGUE_ID}&season_id=${SEASON_ID}&user_token=${USER_TOKEN}`;

        try {
            const data = await this.fetchWithErrorHandling(url);

            // The API might return matches in different formats, adapt as needed
            let matches: any[] = [];
            if (Array.isArray(data)) {
                matches = data;
            } else if (data.matches) {
                matches = data.matches;
            } else if (data.data) {
                matches = data.data;
            } else {
                console.warn('Unexpected API response format:', data);
                return [];
            }

            // Parse result field to extract scores
            return matches.map(match => {
                const result = match.result;
                let home_score: number | undefined;
                let away_score: number | undefined;

                if (result && typeof result === 'string') {
                    const scoreParts = result.split('-');
                    if (scoreParts.length === 2) {
                        home_score = parseInt(scoreParts[0], 10);
                        away_score = parseInt(scoreParts[1], 10);
                    }
                }

                return {
                    ...match,
                    home_score,
                    away_score
                };
            });
        } catch (error) {
            console.error('Failed to fetch matches:', error);
            throw new Error('Failed to fetch matches from EasyCoach API');
        }
    }

    async fetchMatchDetail(matchId: string): Promise<ApiMatchDetail> {
        const url = `${API_BASE_URL}/match?match_id=${matchId}&user_token=${USER_TOKEN}`;

        try {
            const data = await this.fetchWithErrorHandling(url);
            return data;
        } catch (error) {
            console.error('Failed to fetch match detail:', error);
            throw new Error('Failed to fetch match details from EasyCoach API');
        }
    }

    // Utility method to group matches by date
    groupMatchesByDate(matches: ApiMatch[]): Record<string, ApiMatch[]> {
        return matches.reduce((acc, match) => {
            // Use match_date from API or fallback to kickoff
            const dateStr = match.match_date || match.kickoff;

            if (!dateStr) {
                // If no date string, group under "Unknown Date"
                const unknownKey = 'Unknown Date';
                if (!acc[unknownKey]) {
                    acc[unknownKey] = [];
                }
                acc[unknownKey].push(match);
                return acc;
            }

            try {
                const parsedDate = new Date(dateStr);

                // Check if the date is valid
                if (isNaN(parsedDate.getTime())) {
                    throw new Error('Invalid date');
                }

                const date = parsedDate.toISOString().split('T')[0];

                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(match);
            } catch (error) {
                console.warn(`Invalid date format for match ${match.match_id}:`, dateStr);

                // Group invalid dates under "Invalid Date"
                const invalidKey = 'Invalid Date';
                if (!acc[invalidKey]) {
                    acc[invalidKey] = [];
                }
                acc[invalidKey].push(match);
            }

            return acc;
        }, {} as Record<string, ApiMatch[]>);
    }

    // Utility method to format player name
    formatPlayerName(player: ApiPlayer): string {
        return `${player.fname} ${player.lname}`.trim();
    }

    // Utility method to extract events for match details
    extractMatchEvents(players: ApiPlayer[]): ApiEvent[] {
        const events: ApiEvent[] = [];

        players.forEach(player => {
            if (player.events) {
                // Add goals
                if (player.events.goals) {
                    player.events.goals.forEach(goal => {
                        events.push({
                            ...goal,
                            event_type: 'goal',
                            event_label: 'Goal',
                            player_id: player.player_id
                        });
                    });
                }

                // Add yellow cards
                if (player.events.yellows) {
                    player.events.yellows.forEach(yellow => {
                        events.push({
                            ...yellow,
                            event_type: 'yellow_card',
                            event_label: 'Yellow Card',
                            player_id: player.player_id
                        });
                    });
                }

                // Add red cards
                if (player.events.reds) {
                    player.events.reds.forEach(red => {
                        events.push({
                            ...red,
                            event_type: 'red_card',
                            event_label: 'Red Card',
                            player_id: player.player_id
                        });
                    });
                }
            }
        });

        // Sort events by minute and second
        return events.sort((a, b) => {
            if (a.start_minute !== b.start_minute) {
                return a.start_minute - b.start_minute;
            }
            return a.start_second - b.start_second;
        });
    }
}

// Create and export singleton instance
export const easycoachAPI = new EasyCoachAPI();