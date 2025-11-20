import React, { useState } from 'react';
import VideoPlayer from '../components/video/VideoPlayer';

export const VideoPage: React.FC = () => {
    const [url, setUrl] = useState<string | undefined>(undefined);

    return (
        <div className="content-panel">
            <h2 className="page-title">Video</h2>
            <div style={{ marginBottom: 12 }}>
                <input placeholder="Paste video URL" style={{ width: '60%', padding: 8 }} onChange={(e) => setUrl(e.target.value)} />
            </div>
            {url ? <VideoPlayer src={url} /> : <div>Paste a video URL above to preview (e.g., mp4 link).</div>}
        </div>
    );
};

export default VideoPage;
