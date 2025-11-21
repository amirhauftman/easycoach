import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    const location = useLocation();

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    <h1>EasyCoach</h1>
                </Link>
                <nav className="nav">
                    <Link
                        to="/matches"
                        className={`nav-link ${location.pathname.startsWith('/matches') || location.pathname === '/' ? 'active' : ''}`}
                    >
                        Matches
                    </Link>
                    <Link
                        to="/players"
                        className={`nav-link ${location.pathname.startsWith('/players') ? 'active' : ''}`}
                    >
                        Players
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
