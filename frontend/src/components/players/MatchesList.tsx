import React from 'react';
import './MatchesList.css';

interface MatchItem {
    id?: number;
    match_id?: string;
    match_date?: string;
    home_team?: string;
    away_team?: string;
    player_team?: string;
    competition?: string;
    player_minutes?: number;
    player_events?: Array<{
        id: number;
        event_type: string;
        minute: number;
        start_minute: number;
        start_second: number;
        event_label: string;
    }>;
}

const MatchesList: React.FC<{ matches: MatchItem[] }> = ({ matches }) => {
    // Filter out matches with no events
    const matchesWithEvents = matches.filter(m => m.player_events && m.player_events.length > 0);

    if (!matchesWithEvents || matchesWithEvents.length === 0) {
        return (
            <div className="no-matches-message">
                <div className="no-matches-icon">⚽</div>
                <h3>No matches with events found</h3>
                <p>This player hasn't had any events in their recent matches.</p>
            </div>
        );
    }

    return (
        <div className="matches-table-container">
            <table className="matches-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Opponent</th>
                        <th>Competition</th>
                        <th>Minutes</th>
                        <th>Events</th>
                    </tr>
                </thead>
                <tbody>
                    {matchesWithEvents.map((m, idx) => (
                        <tr key={m.match_id ?? m.id ?? idx} className="match-row">
                            <td className="match-date">
                                <div className="date-content">
                                    {m.match_date ? new Date(m.match_date).toLocaleDateString() : '-'}
                                </div>
                            </td>
                            <td className="match-opponent">
                                <div className="opponent-content">
                                    {(() => {
                                        const opponent = m.player_team === m.home_team ? m.away_team : m.home_team;
                                        return <span className="opponent">{opponent || '-'}</span>;
                                    })()}
                                </div>
                            </td>
                            <td className="match-competition">
                                <div className="competition-content">
                                    {m.competition ?? '-'}
                                </div>
                            </td>
                            <td className="match-minutes">
                                <div className="minutes-content">
                                    {m.player_minutes ? `${m.player_minutes}'` : '-'}
                                </div>
                            </td>
                            <td className="match-events">
                                <div className="events-content">
                                    {m.player_events && m.player_events.length > 0 ? (
                                        <div className="events-list">
                                            {m.player_events.slice(0, 3).map((event) => (
                                                <span key={event.id} className={`event-badge event-${event.event_type}`}>
                                                    {event.event_label} ({event.start_minute}{event.start_second > 0 ? `:${event.start_second.toString().padStart(2, '0')}` : ''}')
                                                </span>
                                            ))}
                                            {m.player_events.length > 3 && (
                                                <span className="event-more">+{m.player_events.length - 3} more</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="no-events">-</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MatchesList;
