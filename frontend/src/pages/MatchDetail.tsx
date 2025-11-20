import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MatchPlayer, { type MatchPlayerHandle } from '../components/video/MatchPlayer';
import '../App.css';

const TABS: { key: 'lineups' | 'events'; label: string }[] = [
    { key: 'lineups', label: 'Lineups' },
    { key: 'events', label: 'Match Events' },
];

type Player = {
    id: string | number;
    name: string;
    shirt_number?: string | number;
    position?: string;
};

type Lineup = {
    starters: Player[];
    subs: Player[];
};

type Team = {
    name: string;
};

type Event = {
    minute: number;
    type: string;
    timestamp?: number;
    player?: Player;
};

type Match = {
    home_team?: Team;
    away_team?: Team;
    pixellot_id?: string;
    home_lineup?: Lineup;
    away_lineup?: Lineup;
    events?: Event[];
};

function normalizeLineup(lineup?: Lineup): Lineup {
    if (!lineup) return { starters: [], subs: [] };
    return {
        starters: Array.isArray(lineup.starters) ? lineup.starters : [],
        subs: Array.isArray(lineup.subs) ? lineup.subs : [],
    };
}

const eventTypes: Record<string, string> = {
    goal: 'Goal',
    yellow_card: 'Yellow Card',
};

export default function MatchDetail() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [tab, setTab] = useState<'lineups' | 'events'>('lineups');
    const playerRef = useRef<MatchPlayerHandle | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/data/match-${matchId}.json`)
            .then((res) => res.json())
            .then((data) => {
                setMatch(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [matchId]);

    if (loading) return <div className="panel">Loading...</div>;
    if (!match) return <div className="panel">Match not found.</div>;

    const hasVideo = !!match.pixellot_id;
    const homeLineup = normalizeLineup(match.home_lineup);
    const awayLineup = normalizeLineup(match.away_lineup);
    const events = Array.isArray(match.events) ? match.events : [];

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
            <h2>
                {match.home_team?.name || 'Home'} vs {match.away_team?.name || 'Away'}
            </h2>
            <div className="video-section">
                {hasVideo ? (
                    <MatchPlayer
                        ref={playerRef}
                        iframeUrl={`https://webapp.pixellot.tv/?matchId=${match.pixellot_id}`}
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
                    <div className="lineup-col">
                        <h3>{match.home_team?.name || 'Home Team'}</h3>
                        <table className="lineup-table">
                            <thead>
                                <tr><th colSpan={3}>First 11</th></tr>
                            </thead>
                            <tbody>
                                {homeLineup.starters.map((p: Player) => (
                                    <tr key={p.id} className="player-row" onClick={() => handlePlayerClick(p)}>
                                        <td className="shirt-num">{p.shirt_number || '-'}</td>
                                        <td className="player-name">{p.name}</td>
                                        <td className="player-pos">{p.position || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <thead>
                                <tr><th colSpan={3}>Substitutes</th></tr>
                            </thead>
                            <tbody>
                                {homeLineup.subs.map((p: Player) => (
                                    <tr key={p.id} className="player-row" onClick={() => handlePlayerClick(p)}>
                                        <td className="shirt-num">{p.shirt_number || '-'}</td>
                                        <td className="player-name">{p.name}</td>
                                        <td className="player-pos">{p.position || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="lineup-col">
                        <h3>{match.away_team?.name || 'Away Team'}</h3>
                        <table className="lineup-table">
                            <thead>
                                <tr><th colSpan={3}>First 11</th></tr>
                            </thead>
                            <tbody>
                                {awayLineup.starters.map((p: Player) => (
                                    <tr key={p.id} className="player-row" onClick={() => handlePlayerClick(p)}>
                                        <td className="shirt-num">{p.shirt_number || '-'}</td>
                                        <td className="player-name">{p.name}</td>
                                        <td className="player-pos">{p.position || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <thead>
                                <tr><th colSpan={3}>Substitutes</th></tr>
                            </thead>
                            <tbody>
                                {awayLineup.subs.map((p: Player) => (
                                    <tr key={p.id} className="player-row" onClick={() => handlePlayerClick(p)}>
                                        <td className="shirt-num">{p.shirt_number || '-'}</td>
                                        <td className="player-name">{p.name}</td>
                                        <td className="player-pos">{p.position || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {tab === 'events' && (
                <div className="events-list">
                    <table className="events-table">
                        <thead>
                            <tr>
                                <th>Minute</th>
                                <th>Player</th>
                                <th>Event</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.filter(e => e.type === 'goal' || e.type === 'yellow_card').map((event, idx) => (
                                <tr key={idx} className={hasVideo ? 'event-row clickable' : 'event-row'} onClick={() => handleEventClick(event)}>
                                    <td>{event.minute}</td>
                                    <td>
                                        {event.player ? (
                                            <span className="event-player" onClick={e => { e.stopPropagation(); handlePlayerClick(event.player!); }}>
                                                {event.player.name}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td>{eventTypes[event.type] || event.type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
