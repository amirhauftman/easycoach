import React from 'react';

export const PlayerHeader: React.FC<{ player: any }> = ({ player }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: '#ddd' }} />
        <div>
            <div style={{ fontWeight: 700 }}>{player.name ?? player.player_name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{player.team ?? player.club}</div>
        </div>
    </div>
);

export default PlayerHeader;
