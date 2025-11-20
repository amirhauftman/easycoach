import React from 'react';

export interface Player {
    id: string | number;
    name: string;
    shirt_number?: string | number;
    position?: string;
}

export interface TeamLineupProps {
    teamName: string;
    starters: Player[];
    subs: Player[];
    onPlayerClick?: (player: Player) => void;
}

const TeamLineup: React.FC<TeamLineupProps> = ({ teamName, starters, subs, onPlayerClick }) => (
    <div className="team-lineup">
        <h3>{teamName}</h3>
        <table className="lineup-table">
            <thead>
                <tr><th colSpan={3}>First 11</th></tr>
            </thead>
            <tbody>
                {starters.map((p) => (
                    <tr key={p.id} className="player-row" onClick={() => onPlayerClick?.(p)}>
                        <td className="shirt-num">{p.shirt_number || '-'}</td>
                        <td className="player-name">{p.name}</td>
                        <td className="player-pos">{p.position || ''}</td>
                    </tr>
                ))}
            </tbody>
            <thead>
                <tr><th colSpan={3}>Substitutes</th></tr>
            </thead>
            <tbody>
                {subs.map((p) => (
                    <tr key={p.id} className="player-row" onClick={() => onPlayerClick?.(p)}>
                        <td className="shirt-num">{p.shirt_number || '-'}</td>
                        <td className="player-name">{p.name}</td>
                        <td className="player-pos">{p.position || ''}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default TeamLineup;
