import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApiMatch } from '../../types';

interface Props {
    match: ApiMatch;
}

const MatchCard: React.FC<Props> = ({ match }) => {
    const navigate = useNavigate();
    const id = match.game_id || match.match_id || match.id?.toString();

    const onOpen = () => {
        if (import.meta.env.DEV) {
            console.log('MatchCard onClick, match:', match, 'id:', id);
        }
        if (id) {
            navigate(`/matches/${id}`);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
        }
    };

    return (
        <div
            className="match-card"
            onClick={onOpen}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Match: ${match.home_team} vs ${match.away_team}, Score: ${match.home_score ?? 0} - ${match.away_score ?? 0}`}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>{match.home_team}</div>
                <div style={{ fontWeight: 700 }}>
                    {match.home_score ?? '-'} - {match.away_score ?? '-'}
                </div>
                <div>{match.away_team}</div>
            </div>
            <div className="match-meta">
                {new Date(match.match_date || match.kickoff).toLocaleString()}
            </div>
            {match.competition && <div className="match-competition">{match.competition}</div>}
        </div>
    );
};

export default React.memo(MatchCard);
