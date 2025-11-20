import React from 'react';

interface Props {
    match: any;
}

export const MatchCard: React.FC<Props> = ({ match }) => {
    const id = match.match_id ?? match.id ?? match.matchId
    const onOpen = () => {
        if (id) {
            // simple hash-based navigation used in App
            window.location.hash = `#/match/${id}`
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
