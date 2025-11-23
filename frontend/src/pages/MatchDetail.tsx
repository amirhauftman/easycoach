import { useRef, useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MatchPlayer, { type MatchPlayerHandle } from '../components/video/MatchPlayer';
import { easycoachAPI } from '../services/easycoach-api';
import type { Player, Lineup, Event } from '../types';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import EventsTab from '../components/matches/EventsTab';
import { useMatchDetail } from '../hooks/useQueries';
import { useAppStore } from '../stores/useAppStore';
import '../App.css';

const TABS: { key: 'lineups' | 'events'; label: string }[] = [
    { key: 'lineups', label: 'Lineups' },
    { key: 'events', label: 'Match Events' },
];

function normalizeLineup(lineup?: Lineup): Lineup {
    if (!lineup) return { starters: [], subs: [] };
    return {
        starters: Array.isArray(lineup.starters) ? lineup.starters : [],
        subs: Array.isArray(lineup.subs) ? lineup.subs : [],
    };
}

export default function MatchDetail() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: matchData, isLoading: loading, error } = useMatchDetail(matchId!);
    const { setBreadcrumbs, setSelectedMatchId, setSelectedMatchTitle } = useAppStore();
    const [tab, setTab] = useState<'lineups' | 'events'>('lineups');
    const playerRef = useRef<MatchPlayerHandle | null>(null);

    // Set breadcrumbs when match data is available
    useEffect(() => {
        if (matchData && matchId) {
            setSelectedMatchId(matchId);
            const matchTitle = `${matchData.home_team} vs ${matchData.away_team}`;
            setSelectedMatchTitle(matchTitle);
            setBreadcrumbs([
                { label: 'Matches', path: '/matches', icon: '⚽' },
                { label: matchTitle, icon: '🏆', isActive: true }
            ]);
        }

        return () => {
            setBreadcrumbs([]);
            // Don't clear selectedMatchId here - it's needed for nested pages like PlayerDetail
        };
    }, [matchData, matchId, setBreadcrumbs, setSelectedMatchTitle]);

    // Get pxlt_game_id from navigation state if available
    const pxltGameIdFromState = location.state?.pxlt_game_id;

    const computedData = useMemo(() => {
        if (!matchData) return null;

        const match = {
            vid: matchData.video_url || matchData.video?.normal_hls,
            home_team: { name: matchData.home_team },
            away_team: { name: matchData.away_team },
            pxlt_game_id: matchData.pxlt_game_id,
            home_lineup: {
                starters: matchData.home_team_players.filter(p => p.is_sub === 0).map(p => ({
                    id: p.player_id,
                    name: easycoachAPI.formatPlayerName(p),
                    shirt_number: p.number,
                    position: p.position
                })),
                subs: matchData.home_team_players.filter(p => p.is_sub === 1).map(p => ({
                    id: p.player_id,
                    name: easycoachAPI.formatPlayerName(p),
                    shirt_number: p.number,
                    position: p.position
                }))
            },
            away_lineup: {
                starters: matchData.away_team_players.filter(p => p.is_sub === 0).map(p => ({
                    id: p.player_id,
                    name: easycoachAPI.formatPlayerName(p),
                    shirt_number: p.number,
                    position: p.position
                })),
                subs: matchData.away_team_players.filter(p => p.is_sub === 1).map(p => ({
                    id: p.player_id,
                    name: easycoachAPI.formatPlayerName(p),
                    shirt_number: p.number,
                    position: p.position
                }))
            },
            events: easycoachAPI.extractMatchEvents([...matchData.home_team_players, ...matchData.away_team_players], matchData.events)
                .map(event => ({
                    minute: event.start_minute,
                    type: event.event_type || 'unknown',
                    timestamp: event.timestamp || (event.start_minute * 60 + (event.start_second || 0)),
                    player: {
                        id: event.player_id,
                        name: (() => {
                            const allPlayers = [...matchData.home_team_players, ...matchData.away_team_players];
                            const player = allPlayers.find(p => String(p.player_id) === String(event.player_id));
                            return player ? easycoachAPI.formatPlayerName(player) : 'Unknown Player';
                        })()
                    }
                }))
        };

        const hasVideo = !!pxltGameIdFromState || !!matchData.video_url || !!matchData.video?.normal_hls;
        const videoUrl = matchData.video_url || matchData.video?.normal_hls;
        const homeLineup = normalizeLineup(match.home_lineup);
        const awayLineup = normalizeLineup(match.away_lineup);
        const events = Array.isArray(match.events) ? match.events : [];

        return { match, hasVideo, videoUrl, homeLineup, awayLineup, events };
    }, [matchData, pxltGameIdFromState]);

    if (loading) return <Loading />;
    if (error) return <ErrorMessage error={error.message} />;
    if (!matchData || !computedData) {
        return <div className="panel">No details available for this match.</div>;
    }

    const { match, hasVideo, videoUrl, homeLineup, awayLineup, events } = computedData;

    function handleEventClick(event: Event) {
        if (!hasVideo) return;
        const ts = event.timestamp || event.minute * 60;
        if (playerRef.current) playerRef.current.seekTo(ts);
    }

    function handlePlayerClick(player: Player) {
        if (player && player.id) navigate(`/players/${player.id}`);
    }

    return (
        <div className="panel match-detail">
            <div className="match-detail-header">
                <button className="nav-button back-button" onClick={() => navigate('/matches')}>
                    ← Back to Matches
                </button>
            </div>
            <h2>
                {match.home_team?.name || 'Home'} vs {match.away_team?.name || 'Away'}
            </h2>
            <div className="video-section">
                {hasVideo ? (
                    <MatchPlayer
                        ref={playerRef}
                        hlsUrl={videoUrl}
                    />
                ) : (
                    <div className="no-video">No video available</div>
                )}
            </div>
            <div className="tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        className={tab === t.key ? 'tab active' : 'tab'}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            {tab === 'lineups' && (
                <div className="lineups-table">
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Starting Lineups</h3>
                    <table className="lineup-comparison-table">
                        <thead>
                            <tr>
                                <th>{match.home_team?.name || 'Home Team'}</th>
                                <th>{match.away_team?.name || 'Away Team'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Math.max(homeLineup.starters.length, awayLineup.starters.length) }, (_, i) => (
                                <tr key={i}>
                                    <td className="player-row" onClick={() => homeLineup.starters[i] && handlePlayerClick(homeLineup.starters[i])}>
                                        {homeLineup.starters[i] ? (
                                            <>
                                                <span className="shirt-num">{homeLineup.starters[i].shirt_number || '-'}</span>
                                                <span className="player-name">{homeLineup.starters[i].name}</span>
                                                {homeLineup.starters[i].position && homeLineup.starters[i].position !== 'FW' && (
                                                    <span className="player-pos">{homeLineup.starters[i].position}</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="empty-player">-</span>
                                        )}
                                    </td>
                                    <td className="player-row" onClick={() => awayLineup.starters[i] && handlePlayerClick(awayLineup.starters[i])}>
                                        {awayLineup.starters[i] ? (
                                            <>
                                                <span className="shirt-num">{awayLineup.starters[i].shirt_number || '-'}</span>
                                                <span className="player-name">{awayLineup.starters[i].name}</span>
                                                {awayLineup.starters[i].position && awayLineup.starters[i].position !== 'FW' && (
                                                    <span className="player-pos">{awayLineup.starters[i].position}</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="empty-player">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h3 style={{ textAlign: 'center', margin: '30px 0 20px 0' }}>Substitutes</h3>
                    <table className="lineup-comparison-table">
                        <thead>
                            <tr>
                                <th>{match.home_team?.name || 'Home Team'}</th>
                                <th>{match.away_team?.name || 'Away Team'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Math.max(homeLineup.subs.length, awayLineup.subs.length) }, (_, i) => (
                                <tr key={i}>
                                    <td className="player-row" onClick={() => homeLineup.subs[i] && handlePlayerClick(homeLineup.subs[i])}>
                                        {homeLineup.subs[i] ? (
                                            <>
                                                <span className="shirt-num">{homeLineup.subs[i].shirt_number || '-'}</span>
                                                <span className="player-name">{homeLineup.subs[i].name}</span>
                                                {homeLineup.subs[i].position && homeLineup.subs[i].position !== 'FW' && (
                                                    <span className="player-pos">{homeLineup.subs[i].position}</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="empty-player">-</span>
                                        )}
                                    </td>
                                    <td className="player-row" onClick={() => awayLineup.subs[i] && handlePlayerClick(awayLineup.subs[i])}>
                                        {awayLineup.subs[i] ? (
                                            <>
                                                <span className="shirt-num">{awayLineup.subs[i].shirt_number || '-'}</span>
                                                <span className="player-name">{awayLineup.subs[i].name}</span>
                                                {awayLineup.subs[i].position && awayLineup.subs[i].position !== 'FW' && (
                                                    <span className="player-pos">{awayLineup.subs[i].position}</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="empty-player">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {tab === 'events' && (
                <EventsTab
                    events={events}
                    hasVideo={hasVideo}
                    onEventClick={handleEventClick}
                    onPlayerClick={handlePlayerClick}
                />
            )}
        </div>
    );
}
