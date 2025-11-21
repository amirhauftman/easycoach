import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
    match: any;
}

export const MatchCard: React.FC<Props> = ({ match }) => {
    const navigate = useNavigate();
    const id = match.game_id ?? match.id ?? match.match_id ?? match.matchId
    const onOpen = () => {
        console.log('MatchCard onClick, match:', match, 'id:', id);
        if (id) {
            navigate(`/matches/${id}`);
        }
    }

    return (
        <div className="match-card" onClick={onOpen}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>{match.home_team ?? match.homeTeam ?? 'Home'}</div>
                <div style={{ fontWeight: 700 }}>{(match.home_score ?? match.homeScore) ?? '-'} - {(match.away_score ?? match.awayScore) ?? '-'}</div>
                <div>{match.away_team ?? match.awayTeam ?? 'Away'}</div>
            </div>
            <div className="match-meta">{new Date(match.match_date ?? match.kickoff ?? Date.now()).toLocaleString()}</div>
            {match.competition && <div className="match-competition">{match.competition}</div>}
        </div>
    );
};

export default MatchCard;
