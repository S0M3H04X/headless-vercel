'use client';
import React from 'react';
import styles from './SystemButton.module.scss';

interface SystemButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'normal' | 'primary';
}

export const SystemButton: React.FC<SystemButtonProps> = ({ 
  children, 
  variant = 'normal', 
  className,
  ...props 
}) => {
  return (
    <button 
      className={`${styles.platinumBtn} ${variant === 'primary' ? styles.primary : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};