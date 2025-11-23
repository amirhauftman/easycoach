import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={className || ''}
      type={props.type || 'button'}
      style={{
        padding: '8px 16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        cursor: 'pointer',
        ...props.style
      }}
    >
      {children}
    </button>
  );
};

export default Button;
