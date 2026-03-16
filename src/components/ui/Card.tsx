import React, { forwardRef, ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hoverable = true, onClick, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`bg-white border border-slate-100 rounded-xl ${
          hoverable ? 'transition-shadow duration-300 hover:shadow-md' : ''
        } ${className}`}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';