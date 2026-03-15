'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.3 }}
      className="space-y-4"
    >
      {eyebrow && (
        <p className="text-sm font-semibold tracking-wide text-[#4285F4] uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      {description && (
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl">
          {description}
        </p>
      )}
    </motion.div>
  );
}