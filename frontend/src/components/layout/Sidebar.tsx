import React from 'react';

export const Sidebar: React.FC = () => (
    <aside className="app-sidebar">
        <div className="nav-title">Navigation</div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><a href="#/">Matches</a></li>
            <li><a href="#/players">Players</a></li>
            <li><a href="#/video">Video</a></li>
        </ul>
    </aside>
);

export default Sidebar;
