import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, style }) => (
  <div style={{ padding: 12, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', background: '#fff', ...style }}>
    {children}
  </div>
);

export default Card;
