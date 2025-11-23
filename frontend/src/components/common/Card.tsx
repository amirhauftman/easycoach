import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, style }) => (
  <div style={{
    padding: 12,
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(2, 6, 23, 0.6)',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
    ...style
  }}>
    {children}
  </div>
);

export default Card;
