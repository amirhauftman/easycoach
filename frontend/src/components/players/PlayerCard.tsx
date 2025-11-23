import React from 'react';
import { Link } from 'react-router-dom';
import type { ApiPlayer } from '../../types';

interface PlayerCardProps {
    player: ApiPlayer & {
        name?: string;
        player_name?: string;
        role?: string;
        team_label?: string;
        team_name?: string;
        playerId?: string;
        team_player_id?: string;
    };
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
    const name = player.fname ? `${player.fname} ${player.lname}` : (player.name ?? player.player_name ?? 'Player')
    const initials = name.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase()
    const id = player.player_id ?? player.id ?? player.playerId ?? player.team_player_id ?? '';
    const teamName = player.team_label ?? player.team_name ?? '';
    const to = id ? `/players/${id}?playerName=${encodeURIComponent(name)}&teamName=${encodeURIComponent(teamName)}` : '/players';
    const position = player.position ?? player.role ?? 'Player';

    return (
        <Link
            to={to}
            className="player-card-link"
            style={{ textDecoration: 'none', color: 'inherit' }}
            aria-label={`View ${name}, ${position}${teamName ? ` from ${teamName}` : ''}`}
        >
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

export default React.memo(PlayerCard);
