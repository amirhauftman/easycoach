import React from 'react';

export const PlayerCard: React.FC<{ player: any }> = ({ player }) => {
    const name = player.fname ? `${player.fname} ${player.lname}` : (player.name ?? player.player_name ?? 'Player')
    const initials = name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()
    return (
        <div className="player-card">
            <div className="player-avatar">{initials}</div>
            <div>
                <div className="player-name">{name}</div>
                <div className="player-role">{player.position ?? player.role}</div>
            </div>
        </div>
    );
};

export default PlayerCard;
