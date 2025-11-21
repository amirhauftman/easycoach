// EasyCoach API service functions
import type { ApiMatch, ApiMatchDetail, ApiPlayer, ApiEvent } from '../types';

const API_BASE_URL = 'https://ifa.easycoach.club/en/api/v3/analytics';
const USER_TOKEN = 'YZ3p3MUqQV3KArSSqOrz8SwEIfyFRxRe';
const LEAGUE_ID = '726';
const SEASON_ID = '26';

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

    async fetchMatches(offset: number = 0, limit: number = 50): Promise<ApiMatch[]> {
        const url = `${API_BASE_URL}/league?league_id=${LEAGUE_ID}&season_id=${SEASON_ID}&user_token=${USER_TOKEN}&offset=${offset}&limit=${limit}`;

        try {
            const data = await this.fetchWithErrorHandling(url);
            console.log('Fetched matches data:', data);

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
            const parsedMatches = matches.map(match => {
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

                // Map API fields to our interface
                return {
                    game_id: match.game_id,
                    home_team: match.team_a_name_en || match.team_a_name,
                    away_team: match.team_b_name_en || match.team_b_name,
                    kickoff: match.date + ' ' + match.hour,
                    competition: match.fixture_name_en || match.fixture_name,
                    match_date: match.date,
                    home_team_id: match.team_a_id,
                    away_team_id: match.team_b_id,
                    home_score,
                    away_score,
                    pxlt_game_id: match.pxlt_game_id,
                    season_name: match.season_name,
                };
            });

            console.log('Parsed matches:', parsedMatches);
            return parsedMatches;
        } catch (error) {
            console.error('Failed to fetch matches:', error);
            throw new Error('Failed to fetch matches from EasyCoach API');
        }
    }

    async fetchMatchDetail(matchId: string): Promise<ApiMatchDetail> {
        // For match 1061429, load from local JSON file
        if (matchId === '1061429') {
            try {
                const response = await fetch('/data/match-1061429.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Loaded local match data:', data);
                console.log('Events from local data:', data.events);
                console.log('Home team players events:', data.home_team_players.map((p: any) => ({ name: `${p.fname} ${p.lname}`, events: p.events })));
                console.log('Away team players events:', data.away_team_players.map((p: any) => ({ name: `${p.fname} ${p.lname}`, events: p.events })));

                // Transform local JSON to ApiMatchDetail format
                return {
                    game_id: data.match_id.toString(),
                    match_id: data.match_id.toString(),
                    home_team: data.home_team,
                    away_team: data.away_team,
                    home_score: data.home_score,
                    away_score: data.away_score,
                    match_date: data.match_date,
                    pxlt_game_id: undefined, // No pxlt_game_id in local data
                    home_team_players: data.home_team_players.map((p: any) => ({
                        id: p.player_id,
                        player_id: p.player_id,
                        fname: p.fname,
                        lname: p.lname,
                        number: p.number,
                        position: p.position,
                        is_sub: 0, // Assume all are starters for now
                        team_id: 'home',
                        events: p.events || []
                    })),
                    away_team_players: data.away_team_players.map((p: any) => ({
                        id: p.player_id,
                        player_id: p.player_id,
                        fname: p.fname,
                        lname: p.lname,
                        number: p.number,
                        position: p.position,
                        is_sub: 0, // Assume all are starters for now
                        team_id: 'away',
                        events: p.events || []
                    })),
                    events: data.events || [],
                    video: {
                        normal_hls: 'https://dn3dopmbo1yw3.cloudfront.net/ifaLeagues/67e3281decd54ea7c273f8df/venue_hls/hd_hls/hd_hls.m3u8' // Hardcoded for demo
                    }
                };
            } catch (error) {
                console.error('Failed to load local match data:', error);
                throw new Error('Failed to load local match data');
            }
        }

        // Original API fetch for other matches
        const url = `${API_BASE_URL}/match?match_id=${matchId}&user_token=${USER_TOKEN}`;

        try {
            const data = await this.fetchWithErrorHandling(url);
            console.log('Full match detail API response:', data);

            // The API returns {status: 'ok', match_id: '...', match_details: {..., video: {...}}, teams: [...]}
            // We need to extract the actual match data
            if (data.match_details) {
                const matchDetails = data.match_details;
                console.log('match_details:', matchDetails);
                const teams = data.teams || [];

                // Assume first team is home, second is away (no clear home/away indicator in API)
                const homeTeam = teams[0];
                const awayTeam = teams[1];

                // Extract players from teams
                const home_team_players = homeTeam?.players?.map((p: any) => ({
                    id: p.player_id,
                    player_id: p.player_id,
                    fname: p.player_name_en.split(' ')[0] || '',
                    lname: p.player_name_en.split(' ').slice(1).join(' ') || '',
                    number: p.shirt_number,
                    position: p.goalkeeper === '1' ? 'GK' : '', // Basic position mapping
                    is_sub: p.main === '0' ? 1 : 0, // main=1 means starter, main=0 means sub
                    team_id: homeTeam.team_id,
                    events: p.events || [] // Use events if available
                })) || [];

                const away_team_players = awayTeam?.players?.map((p: any) => ({
                    id: p.player_id,
                    player_id: p.player_id,
                    fname: p.player_name_en.split(' ')[0] || '',
                    lname: p.player_name_en.split(' ').slice(1).join(' ') || '',
                    number: p.shirt_number,
                    position: p.goalkeeper === '1' ? 'GK' : '', // Basic position mapping
                    is_sub: p.main === '0' ? 1 : 0, // main=1 means starter, main=0 means sub
                    team_id: awayTeam.team_id,
                    events: p.events || [] // Use events if available
                })) || [];

                // Extract events from match_details if available
                const matchEvents = matchDetails.events || [];

                return {
                    game_id: matchId,
                    match_id: matchId,
                    home_team: homeTeam?.team_name_english || 'Home Team',
                    away_team: awayTeam?.team_name_english || 'Away Team',
                    home_score: homeTeam?.goals || 0,
                    away_score: awayTeam?.goals || 0,
                    match_date: matchDetails.time,
                    pxlt_game_id: data.pxlt_game_id, // Get pxlt_game_id from top level of response
                    home_team_players,
                    away_team_players,
                    home_team_formation: undefined,
                    away_team_formation: undefined,
                    events: matchEvents, // Include events from match_details
                    video: matchDetails.video // Video data is inside match_details
                };
            }

            // Fallback if structure is different
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
                let parsedDate: Date;

                // Handle DD/MM/YY format
                if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                        const day = parseInt(parts[0], 10);
                        const month = parseInt(parts[1], 10) - 1; // JS months are 0-based
                        const year = 2000 + parseInt(parts[2], 10); // Assume 20xx
                        parsedDate = new Date(year, month, day);
                    } else {
                        parsedDate = new Date(dateStr);
                    }
                } else {
                    parsedDate = new Date(dateStr);
                }

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
                console.warn(`Invalid date format for match ${match.game_id || match.match_id}:`, dateStr);

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
    extractMatchEvents(players: ApiPlayer[], topLevelEvents?: ApiEvent[]): ApiEvent[] {
        const events: ApiEvent[] = [];

        // Extract from players' events
        players.forEach(player => {
            if (player.events) {
                // Handle local JSON format where events is an array
                if (Array.isArray(player.events)) {
                    player.events.forEach(event => {
                        if (event.event_label === 'Goal' || event.event_label === 'Yellow Card') {
                            events.push({
                                id: event.id,
                                player_id: player.player_id,
                                event_id: 0, // Not used
                                start_minute: event.start_minute,
                                start_second: event.start_second,
                                timestamp: event.timestamp,
                                event_type: event.event_label.toLowerCase().replace(' ', '_'),
                                event_label: event.event_label,
                                good_bad: event.good_bad
                            });
                        }
                    });
                } else {
                    // Handle API format with goals/yellows/reds subarrays
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
            }
        });

        // Extract from top-level events if provided
        if (topLevelEvents) {
            topLevelEvents.forEach(event => {
                if (event.event_label === 'Goal' || event.event_label === 'Yellow Card') {
                    events.push({
                        id: event.id,
                        player_id: event.player_id,
                        event_id: event.event_id,
                        start_minute: event.start_minute,
                        start_second: event.start_second,
                        timestamp: event.timestamp,
                        event_type: event.event_label.toLowerCase().replace(' ', '_'),
                        event_label: event.event_label,
                        good_bad: event.good_bad
                    });
                }
            });
        }

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