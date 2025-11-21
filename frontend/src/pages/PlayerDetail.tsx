import { useEffect, useState, type FC } from 'react';
import { useParams } from 'react-router-dom';
import SkillRadar from '../components/players/SkillRadar';
import PlayerHeader from '../components/players/PlayerHeader';
import MatchesList from '../components/players/MatchesList';
import './PlayerDetail.css';

const MOCK_AVERAGE = {
    Passing: 6,
    Dribbling: 5,
    Speed: 7,
    Strength: 6,
    Vision: 6,
    Defending: 5,
};

// Helper function to safely extract events from player object
const extractPlayerEvents = (player: any): any[] => {
    if (!player || !player.events) return [];

    // If events is already an array, return it
    if (Array.isArray(player.events)) return player.events;

    // If events is an object with nested arrays (like {goals: [...], yellows: [...]})
    if (typeof player.events === 'object') {
        const allEvents: any[] = [];
        Object.values(player.events).forEach((eventGroup: any) => {
            if (Array.isArray(eventGroup)) {
                allEvents.push(...eventGroup);
            }
        });
        return allEvents;
    }

    return [];
};

interface PlayerDetailProps {
    playerId?: string;
    playerName?: string;
    teamName?: string;
}

const PlayerDetail: FC<PlayerDetailProps> = ({ playerId: propPlayerId, playerName: propPlayerName, teamName: propTeamName }) => {
    const params = useParams();
    const searchParams = new URLSearchParams(window.location.search);
    const playerId = propPlayerId ?? params.playerId;

    // Get player/team names from URL query params if not provided as props
    const urlPlayerName = searchParams.get('playerName');
    const urlTeamName = searchParams.get('teamName');
    const [player, setPlayer] = useState<any | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [skills, setSkills] = useState<Record<string, number>>(MOCK_AVERAGE);

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Try multiple sources: API, player JSON file, and fallback to breakdown match JSON
                const candidates = [
                    `/api/players/${playerId}`,
                    `/data/player-${playerId}.json`,
                    `/data/player_${playerId}.json`,
                    `/breakdown_game_1061429_league_726.json`,
                ];

                let found: any = null;
                for (const url of candidates) {
                    try {
                        const res = await fetch(url);
                        if (!res.ok) continue;
                        const ct = (res.headers.get('content-type') || '').toLowerCase();
                        if (!ct.includes('application/json')) {
                            // skip HTML responses (server pages) to avoid JSON parse errors
                            continue;
                        }
                        const json = await res.json();
                        found = { url, json };
                        break;
                    } catch (e) {
                        // ignore and continue to next source
                        continue;
                    }
                }

                if (!found) {
                    throw new Error('No JSON player data found (checked API and local files)');
                }

                const { json } = found;

                // Heuristics to extract player and events from returned JSON
                if (json.player) {
                    if (mounted) {
                        setPlayer(json.player);
                        const extractedEvents = extractPlayerEvents(json.player);
                        setEvents(extractedEvents);
                        // if the JSON also represents a match, add it
                        if (json.match_date) {
                            setMatches([{ match_date: json.match_date, home_team: json.home_label, away_team: json.away_label, competition: json.competition ?? '' }]);
                        }
                    }
                } else if (Array.isArray(json)) {
                    // maybe a list of players
                    const p = json.find((pl: any) => String(pl.player_id) === String(playerId) || String(pl.id) === String(playerId));
                    if (mounted) {
                        setPlayer(p ?? null);
                        const extractedEvents = extractPlayerEvents(p);
                        setEvents(extractedEvents);
                    }
                } else if (json.home_team_players || json.away_team_players) {
                    const all = [...(json.home_team_players || []), ...(json.away_team_players || [])];
                    const p = all.find((pl: any) => String(pl.player_id) === String(playerId) || String(pl.id) === String(playerId));
                    if (mounted) {
                        setPlayer(p ?? null);
                        const extractedEvents = extractPlayerEvents(p);
                        setEvents(extractedEvents);
                        // this JSON looks like a match; capture basic match info
                        setMatches([{ match_date: json.match_date, home_team: json.home_label, away_team: json.away_label, competition: json.competition ?? '' }]);
                    }
                } else if (json.data && Array.isArray(json.data)) {
                    const p = json.data.find((pl: any) => String(pl.player_id) === String(playerId) || String(pl.id) === String(playerId));
                    if (mounted) {
                        setPlayer(p ?? null);
                        const extractedEvents = extractPlayerEvents(p);
                        setEvents(extractedEvents);
                    }
                } else {
                    // Unexpected shape; try to find nested player by keys
                    const keys = Object.keys(json || {});
                    let p: any = null;
                    for (const k of keys) {
                        const v = (json as any)[k];
                        if (Array.isArray(v)) {
                            const foundPlayer = v.find((pl: any) => String(pl.player_id) === String(playerId) || String(pl.id) === String(playerId));
                            if (foundPlayer) {
                                p = foundPlayer;
                                break;
                            }
                        }
                    }
                    if (mounted) {
                        setPlayer(p ?? null);
                        const extractedEvents = extractPlayerEvents(p);
                        setEvents(extractedEvents);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch player data:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        return () => {
            mounted = false;
        };
    }, [playerId]);

    useEffect(() => {
        if (!player) return;
        const next: Record<string, number> = { ...MOCK_AVERAGE };
        Object.keys(next).forEach((k) => {
            const keyLower = k.toLowerCase();
            if (player[keyLower]) next[k] = Number(player[keyLower]);
        });
        setSkills(next);

        // If player object has game_time, create a single-match entry as fallback
        if (player.game_time && (!matches || matches.length === 0)) {
            setMatches((m) => [...m, { match_date: player.match_date ?? null, home_team: player.team_label ?? null, away_team: null, competition: player.competition ?? null, minutes_played: player.game_time }]);
        }
    }, [player]);

    if (loading) return <div className="loading">Loading player…</div>;

    // Always show PlayerHeader with fallback data if player not found
    const playerName = player
        ? `${player.fname ?? player.name ?? ''} ${player.lname ?? ''}`.trim()
        : (propPlayerName || urlPlayerName || `Player ${playerId}`);
    const playerPosition = player ? (player.position ?? player.team_position ?? '') : 'Unknown Position';
    const playerTeam = player
        ? (player.team_label ?? player.team_name ?? '')
        : (propTeamName || urlTeamName || 'Unknown Team');
    const playerDOB = player ? (player.dob ?? player.date_of_birth) : undefined;

    return (
        <div className="player-detail-container">
            {/* Full-width header section */}
            <div className="player-header-section">
                <div className="player-header-content">
                    <PlayerHeader
                        name={playerName}
                        position={playerPosition}
                        team={playerTeam}
                        dateOfBirth={playerDOB}
                    />
                </div>
            </div>

            {/* Main content area */}
            <div className="player-content-wrapper">
                <div className="player-content">
                    {/* Skills section */}
                    <div className="content-section skills-section">
                        <h2 className="section-title">Player Skills</h2>
                        <div className="skills-content">
                            <SkillRadar skills={skills} editable={true} onChange={(s) => setSkills(s)} compare={MOCK_AVERAGE} />
                        </div>
                    </div>

                    {/* Match History - Centered */}
                    <div className="content-section matches-section">
                        <h2 className="section-title">Match History</h2>
                        <div className="matches-content">
                            <MatchesList matches={matches.length ? matches : (Array.isArray(events) ? events.map((e) => ({
                                match_id: e.match_id,
                                match_date: e.match_date || e.date || null,
                                home_team: e.home_team || e.team || null,
                                away_team: e.away_team || null,
                                competition: e.competition || null,
                                minutes_played: player?.game_time ?? null,
                            })) : [])} />
                        </div>
                    </div>

                    {/* Events section */}
                    {player && events && Array.isArray(events) && events.length > 0 && (
                        <div className="content-section events-section">
                            <h2 className="section-title">Recent Events</h2>
                            <div className="events-content">
                                <div className="events-list-enhanced">
                                    {events.map((e) => (
                                        <div key={e.id} className="event-item">
                                            <div className="event-label">{e.event_label}</div>
                                            <div className="event-meta">
                                                <span className="event-time">t={e.timestamp}s</span>
                                                <span className="event-minute">{e.start_minute}:{String(e.start_second).padStart(2, '0')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {!player && (
                        <div className="content-section">
                            <div className="no-data-message">
                                <h3>Player data not found</h3>
                                <p>Showing placeholder information with default skills.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerDetail;
