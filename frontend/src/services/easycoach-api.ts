// EasyCoach API service functions
import type { ApiMatch, ApiMatchDetail, ApiPlayer, ApiEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3000/api';

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

    async fetchMatches(): Promise<Record<string, ApiMatch[]>> {
        const url = `${API_BASE_URL}/matches`;

        try {
            const response = await this.fetchWithErrorHandling(url);
            // Backend returns a flat array of matches from DB
            const matches = Array.isArray(response) ? response : [];

            // Transform DB matches to our ApiMatch format
            const transformedMatches: ApiMatch[] = matches.map(match => ({
                game_id: match.match_id,
                home_team: match.home_team,
                away_team: match.away_team,
                kickoff: match.match_date ? new Date(match.match_date).toLocaleString() : 'TBD',
                competition: match.competition || 'No competition name',
                match_date: match.match_date ? new Date(match.match_date).toISOString().split('T')[0] : '1970-01-01',
                home_team_id: match.home_team_id || '',
                away_team_id: match.away_team_id || '',
                home_score: match.home_score,
                away_score: match.away_score,
                pxlt_game_id: match.pxlt_game_id,
                season_name: match.season_name,
            }));

            // Group matches by date using the existing utility method
            const groupedMatches = this.groupMatchesByDate(transformedMatches);
            return groupedMatches;
        } catch (error) {
            console.error('Failed to fetch matches:', error);
            throw new Error('Failed to fetch matches from backend API');
        }
    }

    async fetchMatchDetail(matchId: string): Promise<ApiMatchDetail> {
        // For match 1061429, load from local JSON file (demo)
        if (matchId === '1061429') {
            try {
                const response = await fetch('/data/match-1061429.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (import.meta.env.DEV) {
                    console.log('Loaded local match data:', data);
                    console.log('Events from local data:', data.events);
                    console.log('Home team players events:', data.home_team_players.map((p: any) => ({ name: `${p.fname} ${p.lname}`, events: p.events })));
                    console.log('Away team players events:', data.away_team_players.map((p: any) => ({ name: `${p.fname} ${p.lname}`, events: p.events })));
                }

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

        // Call backend for other matches
        const url = `${API_BASE_URL}/matches/${matchId}`;

        try {
            const data = await this.fetchWithErrorHandling(url);
            if (import.meta.env.DEV) {
                console.log('Full match detail API response:', data);
            }

            // The API returns {status: 'ok', match_id: '...', match_details: {..., video: {...}}, teams: [...]}
            // We need to extract the actual match data
            if (data.match_details) {
                const matchDetails = data.match_details;
                if (import.meta.env.DEV) {
                    console.log('match_details:', matchDetails);
                }
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
            throw new Error('Failed to fetch match details from backend API');
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
        return `${player.fname} ${player.lname}`.trim().toLowerCase();
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

    async fetchPlayer(playerId: string): Promise<any> {
        const url = `${API_BASE_URL}/players/${playerId}`;
        return await this.fetchWithErrorHandling(url);
    }

    async fetchPlayerMatches(playerId: string): Promise<any[]> {
        const url = `${API_BASE_URL}/matches/player/${playerId}`;
        return await this.fetchWithErrorHandling(url);
    }

    // Skill-related API methods
    async fetchPlayerSkills(playerId: string): Promise<Record<string, number>> {
        const url = `${API_BASE_URL}/players/${playerId}`;
        try {
            const result = await this.fetchWithErrorHandling(url);
            if (import.meta.env.DEV) {
                console.log('Player data loaded from backend:', result);
            }
            // Extract skills from player.stats if available
            const skills = result?.stats || {};
            return {
                Passing: skills.passing || 5,
                Dribbling: skills.dribbling || 5,
                Speed: skills.speed || 5,
                Strength: skills.strength || 5,
                Vision: skills.vision || 5,
                Defending: skills.defending || 5,
            };
        } catch (error) {
            console.warn('Backend player data not available, checking localStorage...');

            // Check localStorage for previously saved skills
            try {
                const storageKey = `player-skills-${playerId}`;
                const savedSkills = localStorage.getItem(storageKey);

                if (savedSkills) {
                    const parsedSkills = JSON.parse(savedSkills);
                    if (import.meta.env.DEV) {
                        console.log('Skills loaded from localStorage:', parsedSkills);
                    }
                    return parsedSkills;
                }
            } catch (localError) {
                console.warn('Failed to load from localStorage:', localError);
            }

            // Final fallback: use default mock skills
            if (import.meta.env.DEV) {
                console.warn('Using default mock skills');
            }
            const defaultSkills = {
                Passing: 6,
                Dribbling: 5,
                Speed: 7,
                Strength: 6,
                Vision: 6,
                Defending: 5,
            };

            return defaultSkills;
        }
    }

    async savePlayerSkills(playerId: string, skills: Record<string, number>): Promise<any> {
        if (import.meta.env.DEV) {
            console.log('savePlayerSkills called with playerId:', playerId, 'skills:', skills);
        }
        const url = `${API_BASE_URL}/players/${playerId}/stats`;

        // Transform skills object to match backend DTO format (lowercase keys)
        const statsPayload = {
            passing: skills.Passing,
            dribbling: skills.Dribbling,
            speed: skills.Speed,
            strength: skills.Strength,
            vision: skills.Vision,
            defending: skills.Defending,
        };

        try {
            if (import.meta.env.DEV) {
                console.log('Attempting to save to backend at:', url, 'with payload:', statsPayload);
            }
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(statsPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (import.meta.env.DEV) {
                console.log('Skills saved successfully to backend:', result);
            }
            return { success: true, message: result.message || 'Skills saved successfully', skills, source: 'backend' };
        } catch (error) {
            console.error('Backend save failed:', error);

            // Fallback: Save to localStorage when backend is not available
            try {
                const storageKey = `player-skills-${playerId}`;
                localStorage.setItem(storageKey, JSON.stringify(skills));
                if (import.meta.env.DEV) {
                    console.log('Skills saved to localStorage as fallback with key:', storageKey);
                }

                // Simulate network delay for realistic UX
                await new Promise(resolve => setTimeout(resolve, 500));

                return {
                    success: true,
                    message: 'Skills saved locally (backend unavailable)',
                    skills,
                    source: 'localStorage'
                };
            } catch (localError) {
                console.error('localStorage save also failed:', localError);
                throw new Error('Unable to save skills - both backend and localStorage failed');
            }
        }
    }
}

// Create and export singleton instance
export const easycoachAPI = new EasyCoachAPI();