import React from 'react';
import styles from '../../styles/Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={`${styles.button} ${className || ''}`}
      type={props.type || 'button'}
    >
      {children}
    </button>
  );
};

export default Button;
