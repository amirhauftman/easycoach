import React from 'react';

export const VideoControls: React.FC<{ onPlay?: () => void; onPause?: () => void }> = ({ onPlay, onPause }) => {
    return (
        <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onPlay}>Play</button>
            <button onClick={onPause}>Pause</button>
        </div>
    );
};

export default VideoControls;
