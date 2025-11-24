import React from 'react';
import type { Player } from '../../types';

interface PlayerRowProps {
    player?: Player;
    onPlayerClick: (player: Player) => void;
    teamName?: string;
}

export const PlayerRow: React.FC<PlayerRowProps> = ({ player, onPlayerClick }) => (
    <td className="player-row" onClick={() => player && onPlayerClick(player)}>
        {player ? (
            <>
                <span className="shirt-num">{player.shirt_number || '-'}</span>
                <span className="player-name">{player.name}</span>
                {player.position && player.position !== 'FW' && (
                    <span className="player-pos">{player.position}</span>
                )}
            </>
        ) : (
            <span className="empty-player">-</span>
        )}
    </td>
);

export default PlayerRow;