import React from 'react';

export const VideoPlayer: React.FC<{ src?: string; poster?: string }> = ({ src, poster }) => {
    return (
        <div>
            <video src={src} poster={poster} controls style={{ width: '100%', borderRadius: 8 }} />
        </div>
    );
};

export default VideoPlayer;
