import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '../components/video/VideoPlayer';
import { useAppStore } from '../stores/useAppStore';
import type { BreadcrumbItem } from '../components/common/Breadcrumb';

export const VideoPage: React.FC = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const { setBreadcrumbs } = useAppStore();
    const [url, setUrl] = useState<string | undefined>(undefined);

    // Set breadcrumbs for video page
    useEffect(() => {
        const breadcrumbs: BreadcrumbItem[] = [
            { label: 'Home', path: '/', icon: '🏠' },
            { label: 'Matches', path: '/matches', icon: '⚽' }
        ];

        if (matchId) {
            breadcrumbs.push(
                { label: 'Match Detail', path: `/matches/${matchId}`, icon: '🏆' },
                { label: 'Video', icon: '🎥', isActive: true }
            );
        } else {
            breadcrumbs.push({ label: 'Video', icon: '🎥', isActive: true });
        }

        setBreadcrumbs(breadcrumbs);

        return () => setBreadcrumbs([]);
    }, [matchId, setBreadcrumbs]);

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
