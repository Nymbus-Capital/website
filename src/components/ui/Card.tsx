'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300',
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}