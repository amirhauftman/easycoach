import React from 'react';
import { Link } from 'react-router-dom';

export const PlayerCard: React.FC<{ player: any }> = ({ player }) => {
    const name = player.fname ? `${player.fname} ${player.lname}` : (player.name ?? player.player_name ?? 'Player')
    const initials = name.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase()
    const id = player.player_id ?? player.id ?? player.playerId ?? player.team_player_id ?? '';
    const teamName = player.team_label ?? player.team_name ?? '';
    const to = id ? `/players/${id}?playerName=${encodeURIComponent(name)}&teamName=${encodeURIComponent(teamName)}` : '/players';
    return (
        <Link to={to} className="player-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="player-card">
                <div className="player-avatar">{initials}</div>
                <div>
                    <div className="player-name">{name}</div>
                    <div className="player-role">{player.position ?? player.role}</div>
                </div>
            </div>
        </Link>
    );
};

export default PlayerCard;
