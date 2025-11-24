import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatKickoffTime, type NormalizedMatch } from '../../utils/matchUtils';

interface MatchCardProps {
    match: NormalizedMatch;
}

// Team logo generator
const getTeamLogo = (team: string, type: 'home' | 'away') => {
    if (!team) return <span className="team-logo-circle">?</span>;
    if (type === 'home') return "🏠";
    if (type === 'away') return "🚩";

    const initials = team.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    let hash = 0;
    for (let i = 0; i < team.length; i++) hash = team.charCodeAt(i) + ((hash << 5) - hash);
    const color = `hsl(${hash % 360},70%,60%)`;
    return <span className="team-logo-circle" style={{ background: color, color: '#fff' }}>{initials}</span>;
};

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        if (match.id) {
            navigate(`/matches/${match.id}`, {
                state: { pxlt_game_id: match.pxltGameId }
            });
        }
    };

    return (
        <div className="match-card">
            <div className="match-teams-container">
                <div className="match-team">
                    <span className="team-label">Home team</span>
                    <div className="team-info">
                        <span className="team-logo">{getTeamLogo(match.homeTeam, 'home')}</span>
                        <span className="team-name">{match.homeTeam}</span>
                    </div>
                </div>

                <div className="match-score">
                    {match.homeScore} - {match.awayScore}
                </div>

                <div className="match-team">
                    <span className="team-label">Away team</span>
                    <div className="team-info">
                        <span className="team-logo">{getTeamLogo(match.awayTeam, 'away')}</span>
                        <span className="team-name">{match.awayTeam}</span>
                    </div>
                </div>
            </div>

            <div className="match-meta">
                <div><strong>Kick-off:</strong> {formatKickoffTime(match.kickoff)}</div>
                <div><strong>Competition:</strong> {match.competition}</div>
                {match.hasVideo && (
                    <div className="video-indicator">
                        📹 Video available
                    </div>
                )}
            </div>

            <div className="match-actions">
                {match.id ? (
                    <button className="nav-button" onClick={handleViewDetails}>
                        View Details
                    </button>
                ) : (
                    <button className="nav-button" disabled title="No match details available">
                        No Details
                    </button>
                )}
            </div>
        </div>
    );
};

export default MatchCard;