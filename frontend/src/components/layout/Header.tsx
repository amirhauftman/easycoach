import React from 'react';

export type NavView = 'matches' | 'players' | 'video';

export const Header: React.FC<{ onNavigate?: (view: NavView) => void }> = ({ onNavigate }) => (
    <header className="app-header">
        <div className="logo-text">EasyCoach</div>
        <nav className="nav">
            <button className="nav-button" onClick={(e) => { e.preventDefault(); onNavigate?.('matches'); }}>Matches</button>
            <button className="nav-button" onClick={(e) => { e.preventDefault(); onNavigate?.('players'); }}>Players</button>
            <button className="nav-button" onClick={(e) => { e.preventDefault(); onNavigate?.('video'); }}>Video</button>
        </nav>
    </header>
);

export default Header;
