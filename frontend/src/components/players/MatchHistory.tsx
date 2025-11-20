import React from 'react';

export const MatchHistory: React.FC<{ matches?: any[] }> = ({ matches = [] }) => {
    if (matches.length === 0) return <div>No match history</div>;

    return (
        <ul>
            {matches.map((m: any) => (
                <li key={m.match_id ?? m.id}>{m.opponent ?? m.team} — {m.result ?? `${m.home_score}-${m.away_score}`}</li>
            ))}
        </ul>
    );
};

export default MatchHistory;
