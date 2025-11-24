import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MatchPlayer, { type MatchPlayerHandle } from '../components/video/MatchPlayer';
import type { Player, Event } from '../types';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import EventsTab from '../components/matches/EventsTab';
import PlayerRow from '../components/matches/PlayerRow';
import { useMatchDetail } from '../hooks/useQueries';
import { useMatchLineups, useMatchEvents, useVideoData } from '../hooks/useMatchData';
import { useAppStore } from '../stores/useAppStore';
import '../App.css';

const TABS: { key: 'lineups' | 'events'; label: string }[] = [
    { key: 'lineups', label: 'Lineups' },
    { key: 'events', label: 'Match Events' },
];

export default function MatchDetail() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: matchData, isLoading: loading, error } = useMatchDetail(matchId!);
    const { setBreadcrumbs, setSelectedMatchId, setSelectedMatchTitle } = useAppStore();
    const [viewMode, setViewMode] = useState<'lineups' | 'events-sidebar'>('lineups');
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
        };
    }, [matchData, matchId, setBreadcrumbs, setSelectedMatchTitle]);

    const pxltGameIdFromState = location.state?.pxlt_game_id;

    // Use custom hooks for data processing
    const { homeLineup, awayLineup } = useMatchLineups(matchData);
    const events = useMatchEvents(matchData);
    const { hasVideo, videoUrl } = useVideoData(matchData, pxltGameIdFromState);

    // Derived state
    const showEventsSidebar = viewMode === 'events-sidebar';
    const match = matchData ? {
        home_team: { name: matchData.home_team },
        away_team: { name: matchData.away_team }
    } : null;

    if (loading) return <Loading />;
    if (error) return <ErrorMessage error={error.message} />;
    if (!matchData || !match || !homeLineup || !awayLineup) {
        return <div className="panel">No details available for this match.</div>;
    }

    const handleEventClick = useCallback((event: Event) => {
        if (!hasVideo) return;
        const ts = event.timestamp || event.minute * 60;
        if (playerRef.current) playerRef.current.seekTo(ts);
    }, [hasVideo]);

    const handlePlayerClick = useCallback((player: Player) => {
        if (player && player.id) navigate(`/players/${player.id}`);
    }, [navigate]);

    const handleTabChange = useCallback((tabKey: 'lineups' | 'events') => {
        setViewMode(tabKey === 'events' ? 'events-sidebar' : 'lineups');
    }, []);

    const handleCloseSidebar = useCallback(() => {
        setViewMode('lineups');
    }, []);

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
            <div className={showEventsSidebar ? "video-and-events-container" : "video-section"}>
                <div className="video-content">
                    {hasVideo ? (
                        <MatchPlayer
                            ref={playerRef}
                            hlsUrl={videoUrl}
                        />
                    ) : (
                        <div className="no-video">No video available</div>
                    )}
                </div>
                {showEventsSidebar && (
                    <div className="events-sidebar">
                        <div className="events-sidebar-header">
                            <h3>Match Events</h3>
                            <button
                                className="close-events-sidebar"
                                onClick={handleCloseSidebar}
                            >
                                ✕
                            </button>
                        </div>
                        <EventsTab
                            events={events}
                            hasVideo={hasVideo}
                            onEventClick={handleEventClick}
                            onPlayerClick={handlePlayerClick}
                        />
                    </div>
                )}
            </div>
            <div className="tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        className={((t.key === 'lineups' && viewMode === 'lineups') || (t.key === 'events' && viewMode === 'events-sidebar')) ? 'tab active' : 'tab'}
                        onClick={() => handleTabChange(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            {viewMode === 'lineups' && (
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
                                    <PlayerRow
                                        player={homeLineup.starters[i]}
                                        onPlayerClick={handlePlayerClick}
                                    />
                                    <PlayerRow
                                        player={awayLineup.starters[i]}
                                        onPlayerClick={handlePlayerClick}
                                    />
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
                                    <PlayerRow
                                        player={homeLineup.subs[i]}
                                        onPlayerClick={handlePlayerClick}
                                    />
                                    <PlayerRow
                                        player={awayLineup.subs[i]}
                                        onPlayerClick={handlePlayerClick}
                                    />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}
