import React from 'react';
import './PlayerHeader.css';

interface PlayerHeaderProps {
    name: string;
    position?: string;
    team?: string;
    teamUrl?: string;
    nationality?: string;
    imageSrc?: string | null;
    dateOfBirth?: string;
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({ name, position, team, teamUrl, nationality, imageSrc, dateOfBirth }) => {
    const initials = (name || 'P').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
    const avatar = imageSrc ?? '/assets/avatar.svg';
    const teamBadge = `/assets/team-badge.svg`;
    return (
        <div className="player-header">
            {avatar ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={avatar} alt={`Avatar of ${name}`} className="player-avatar" onError={(e: any) => { e.currentTarget.style.display = 'none' }} />
            ) : (
                <div className="player-avatar player-avatar--initials">{initials}</div>
            )}
            <div className="player-info">
                <h1>{name}</h1>
                {position && <p>Position: {position}</p>}
                {team && (
                    <p className="player-team">Team: {teamUrl ? <a href={teamUrl} target="_blank" rel="noreferrer">{team}</a> : team}
                        <img src={teamBadge} alt="team badge" className="team-badge" onError={(e: any) => { e.currentTarget.style.display = 'none' }} /></p>
                )}
                {nationality && <p>Nationality: {nationality}</p>}
                {dateOfBirth && <p>Date of Birth: {new Date(dateOfBirth).toLocaleDateString()}</p>}
            </div>
        </div>
    );
};

export default PlayerHeader;
