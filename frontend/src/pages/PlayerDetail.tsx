import { useEffect, useState, type FC } from 'react';
import SkillRadar from '../components/players/SkillRadar';

const MOCK_AVERAGE = {
    Passing: 6,
    Dribbling: 5,
    Speed: 7,
    Strength: 6,
    Vision: 6,
    Defending: 5,
};

const PlayerDetail: FC<{ playerId?: string }> = ({ playerId }) => {
    const [player, setPlayer] = useState<any | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [skills, setSkills] = useState<Record<string, number>>(MOCK_AVERAGE);

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/data/player-${playerId}.json`);
                if (!res.ok) throw new Error(`${res.status}`);
                const json = await res.json();
                if (mounted) {
                    setPlayer(json.player ?? null);
                    setEvents(json.events ?? []);
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
    }, [player]);

    if (loading) return <div>Loading player…</div>;
    if (!player) return <div>Player not found</div>;

    return (
        <div className="content-panel">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="player-avatar" style={{ width: 68, height: 68, fontSize: 20 }}>
                    {(player.fname ? player.fname[0] + (player.lname?.[0] || '') : 'P').toUpperCase()}
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>{player.fname} {player.lname}</h3>
                    <div className="muted">#{player.number} — {player.position}</div>
                    {player.dob && (
                        <div className="muted">Date of birth: {new Date(player.dob).toLocaleDateString()}</div>
                    )}
                </div>
            </div>

            <h4 style={{ marginTop: 18 }}>Skills</h4>
            <SkillRadar skills={skills} editable={true} onChange={(s) => setSkills(s)} compare={MOCK_AVERAGE} />

            <h4 style={{ marginTop: 18 }}>Events</h4>
            <div className="events-list">
                {events.length === 0 && <div className="muted">No events for this player.</div>}
                {events.map((e) => (
                    <div key={e.id} style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        {e.event_label} — <span className="muted">t={e.timestamp}s — minute {e.start_minute}:{String(e.start_second).padStart(2, '0')}</span>
                    </div>
                ))}
            </div>

            <h4 style={{ marginTop: 18 }}>Match History</h4>
            <div>
                {events.length === 0 && <div className="muted">No matches found</div>}
                {events.map((m) => (
                    <div key={m.match_id} style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        {new Date(m.match_date).toLocaleDateString()} — {m.home_team} vs {m.away_team} — {m.competition ?? ''}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerDetail;
