
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination';

interface Props {
    matchesByDate: Record<string, any[]>;
    total: number;
}

// Fake logo generator (emoji or SVG placeholder)
const getTeamLogo = (team: string, type: 'home' | 'away') => {
    if (!team) return <span className="team-logo-circle">?</span>;
    if (type === 'home') return "🏠";
    if (type === 'away') return "🚩";
    // fallback: initials in a colored circle
    const initials = team.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    let hash = 0;
    for (let i = 0; i < team.length; i++) hash = team.charCodeAt(i) + ((hash << 5) - hash);
    const color = `hsl(${hash % 360},70%,60%)`;
    return <span className="team-logo-circle" style={{ background: color, color: '#fff' }}>{initials}</span>;
};


export const MatchList: React.FC<Props> = ({ matchesByDate }) => {
    const navigate = useNavigate();
    // Flatten all matches from input and filter for only matches with video
    const flat = useMemo(() => {
        const out: any[] = [];
        Object.values(matchesByDate ?? {}).forEach((matches) => {
            const items = Array.isArray(matches) ? matches : Object.values(matches ?? {})
            items.forEach((m: any) => {
                // Only include matches that have video available (pxlt_game_id or video_url)
                if (m.pxlt_game_id || m.video_url || m.video?.normal_hls) {
                    out.push(m);
                }
            });
        });
        return out;
    }, [matchesByDate]);

    // Group by actual match day (from kickoff or date field)
    const groupedByDay = useMemo(() => {
        const out: Record<string, any[]> = {};
        flat.forEach((m: any) => {
            const kickoff = m.kickoff ?? m.kickoff_time ?? m.date ?? m.match_date ?? null;
            let dayKey = '-';
            if (kickoff) {
                try {
                    const d = new Date(kickoff);
                    dayKey = isNaN(d.getTime()) ? String(kickoff) : d.toISOString().slice(0, 10);
                } catch {
                    dayKey = String(kickoff);
                }
            }
            if (!out[dayKey]) out[dayKey] = [];
            out[dayKey].push(m);
        });
        return out;
    }, [flat]);

    // Pagination logic
    const allDays = Object.keys(groupedByDay).sort((a, b) => {
        // Sort dates descending (most recent first)
        if (a === '-' || b === '-') return a === '-' ? 1 : -1;
        try {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateB.getTime() - dateA.getTime();
        } catch {
            return b.localeCompare(a);
        }
    });
    const allMatches = allDays.flatMap(day => {
        // Sort matches within each day by kickoff time
        const dayMatches = groupedByDay[day].sort((a: any, b: any) => {
            const timeA = a.kickoff ?? a.kickoff_time ?? a.date ?? a.match_date ?? '';
            const timeB = b.kickoff ?? b.kickoff_time ?? b.date ?? b.match_date ?? '';
            try {
                const dateA = new Date(timeA);
                const dateB = new Date(timeB);
                return dateA.getTime() - dateB.getTime();
            } catch {
                return String(timeA).localeCompare(String(timeB));
            }
        });
        return dayMatches.map(m => ({ ...m, _day: day }));
    }).sort((a, b) => {
        // Overall sort by full date/time descending (most recent first)
        const timeA = a.kickoff ?? a.kickoff_time ?? a.date ?? a.match_date ?? '';
        const timeB = b.kickoff ?? b.kickoff_time ?? b.date ?? b.match_date ?? '';

        const parseDate = (dateStr: string) => {
            if (!dateStr) return null;

            // Handle DD/MM/YY HH:MM format
            const ddmmyyPattern = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/;
            const match = String(dateStr).match(ddmmyyPattern);

            if (match) {
                const [, day, month, year, hour = '0', minute = '0'] = match;
                const fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);
                return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
            }

            // Fallback to standard Date parsing
            try {
                return new Date(dateStr);
            } catch {
                return null;
            }
        };

        const dateA = parseDate(String(timeA));
        const dateB = parseDate(String(timeB));

        if (dateA && dateB && !isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return dateB.getTime() - dateA.getTime();
        }

        // Fallback to string comparison
        return String(timeB).localeCompare(String(timeA));
    });
    const [page, setPage] = useState(1);
    const [size, setSize] = useState<number>(5);
    const start = (page - 1) * size;
    const pageItems = allMatches.slice(start, start + size);
    // Group pageItems by day for rendering
    const pageGrouped = useMemo(() => {
        const out: Record<string, any[]> = {};
        pageItems.forEach((m: any) => {
            if (!out[m._day]) out[m._day] = [];
            out[m._day].push(m);
        });
        return out;
    }, [pageItems]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                {/* <div className="muted">Matches with video: {allMatches.length}</div> */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label className="muted">Per page:</label>
                    <span className="select-wrapper">
                        <select className="select-control" value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                        </select>
                    </span>
                </div>
            </div>

            {/* Grouped by actual match day headings */}
            {Object.entries(pageGrouped).map(([day, matches]) => {
                let dateLabel = day;
                try {
                    const d = new Date(day);
                    dateLabel = isNaN(d.getTime()) ? day : d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                } catch {
                    dateLabel = day;
                }
                return (
                    <div key={day} className="match-day-group">
                        <div className="match-day-heading">{dateLabel}</div>
                        <div className="matches-grid">
                            {matches.map((m: any, idx: number) => {
                                const homeTeam = m.home_team ?? m.homeTeam ?? m.team_home ?? m.team_a_name_en ?? '';
                                const awayTeam = m.away_team ?? m.awayTeam ?? m.team_away ?? m.team_b_name_en ?? '';
                                const homeScore = m.home_score ?? m.homeScore ?? m.score_home ?? '-';
                                const awayScore = m.away_score ?? m.awayScore ?? m.score_away ?? '-';
                                const kickoff = m.kickoff ?? m.kickoff_time ?? m.date ?? m.match_date ?? null;
                                const comp = m.competition ?? m.season_name ?? 'no competition name';
                                let kickoffLabel = '-';
                                if (kickoff) {
                                    try {
                                        const k = new Date(kickoff);
                                        kickoffLabel = isNaN(k.getTime()) ? String(kickoff) : k.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                                    } catch {
                                        kickoffLabel = String(kickoff);
                                    }
                                }
                                const matchId = m.game_id ?? m.match_id ?? m.id;
                                return (
                                    <div key={`${day}-${matchId ?? idx}`} className="match-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span className="muted" style={{ fontSize: '0.85em' }}>Home team </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span className="team-logo">{getTeamLogo(homeTeam, 'home')}</span>
                                                    <span style={{ fontWeight: 700 }}>{String(homeTeam)}</span>
                                                </span>
                                            </div>
                                            <span style={{ margin: '0 8px', fontWeight: 700 }}>{homeScore} - {awayScore}</span>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span className="muted" style={{ fontSize: '0.85em' }}>Away team </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span className="team-logo">{getTeamLogo(awayTeam, 'away')}</span>
                                                    <span style={{ fontWeight: 700 }}>{String(awayTeam)}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="match-meta" style={{ marginTop: 6 }}>
                                            <span><strong>Kick-off:</strong> {kickoffLabel || '-'}</span><br />
                                            <span><strong>Competition:</strong> {comp}</span>
                                            {m.pxlt_game_id && (
                                                <span style={{ display: 'inline-block', marginLeft: 8, color: 'var(--accent)', fontSize: '0.8em' }}>
                                                    📹 Video available
                                                </span>
                                            )}
                                        </div>
                                        {matchId ? (
                                            <button className="nav-button" style={{ marginTop: 8 }} onClick={() => navigate(`/matches/${matchId}`, { state: { pxlt_game_id: m.pxlt_game_id } })}>View Details</button>
                                        ) : (
                                            <button className="nav-button" style={{ marginTop: 8 }} disabled title="No match details available">No Details</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            <div className="pagination" style={{ marginTop: 12 }}>
                <Pagination total={allMatches.length} pageSize={size} page={page} onPageChange={(p) => setPage(Math.max(1, Math.min(Math.ceil(allMatches.length / size || 1), p)))} />
            </div>
        </div>
    );
};

export default MatchList;
