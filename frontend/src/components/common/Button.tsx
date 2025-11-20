import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button {...props} style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>
      {children}
    </button>
  );
};

export default Button;
