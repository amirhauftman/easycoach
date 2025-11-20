import React from 'react';

export const LineupTab: React.FC<{ lineup?: any[] }> = ({ lineup = [] }) => {
    return (
        <div>
            {lineup.length === 0 ? (
                <div>No lineup available</div>
            ) : (
                <ul>
                    {lineup.map((p: any) => (
                        <li key={p.id ?? p.player_id}>{p.name ?? p.player_name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LineupTab;
