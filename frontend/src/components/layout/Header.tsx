import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    return (
        <header className="header" role="banner">
            <div className="header-content">
                <Link to="/" className="logo" aria-label="EasyCoach Home">
                    <h1>EasyCoach</h1>
                </Link>
            </div>
        </header>
    );
};

export default Header;
