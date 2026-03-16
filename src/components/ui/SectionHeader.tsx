import React, { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string | ReactNode;
  description?: string | ReactNode;
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-16 ${className}`}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-widest font-semibold text-blue-600 mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}