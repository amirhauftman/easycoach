import React from 'react';
import './MatchesList.css';

interface MatchItem {
    match_id?: string | number;
    match_date?: string;
    home_team?: string;
    away_team?: string;
    competition?: string;
    minutes_played?: number | string;
}

const MatchesList: React.FC<{ matches: MatchItem[] }> = ({ matches }) => {
    if (!matches || matches.length === 0) {
        return (
            <div className="no-matches-message">
                <div className="no-matches-icon">⚽</div>
                <h3>No matches found</h3>
                <p>This player hasn't played any matches yet.</p>
            </div>
        );
    }

    return (
        <div className="matches-table-container">
            <table className="matches-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Match</th>
                        <th>Competition</th>
                        <th>Minutes</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map((m, idx) => (
                        <tr key={m.match_id ?? idx} className="match-row">
                            <td className="match-date">
                                <div className="date-content">
                                    {m.match_date ? new Date(m.match_date).toLocaleDateString() : '-'}
                                </div>
                            </td>
                            <td className="match-teams">
                                <div className="teams-content">
                                    <span className="home-team">{m.home_team || '-'}</span>
                                    <span className="vs-separator">vs</span>
                                    <span className="away-team">{m.away_team || '-'}</span>
                                </div>
                            </td>
                            <td className="match-competition">
                                <div className="competition-content">
                                    {m.competition ?? '-'}
                                </div>
                            </td>
                            <td className="match-minutes">
                                <div className="minutes-content">
                                    <span className="minutes-value">{m.minutes_played ?? '-'}</span>
                                    {m.minutes_played && <span className="minutes-label">min</span>}
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
