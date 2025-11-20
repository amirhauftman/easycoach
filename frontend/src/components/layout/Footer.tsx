import React from 'react';

export const Footer: React.FC = () => (
    <footer className="app-footer">
        © {new Date().getFullYear()} EasyCoach
    </footer>
);

export default Footer;
