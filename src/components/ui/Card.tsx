import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hoverable = true, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-100 rounded-xl ${
        hoverable ? 'transition-shadow duration-300 hover:shadow-md' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}