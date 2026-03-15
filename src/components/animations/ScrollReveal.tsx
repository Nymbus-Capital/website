"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  stagger?: boolean;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  stagger = false,
  className = "",
}: ScrollRevealProps) {
  const getInitialVariant = (dir: Direction) => {
    const baseVariant = {
      opacity: 0,
    };

    switch (dir) {
      case "up":
        return { ...baseVariant, y: 40 };
      case "down":
        return { ...baseVariant, y: -40 };
      case "left":
        return { ...baseVariant, x: 40 };
      case "right":
        return { ...baseVariant, x: -40 };
      default:
        return baseVariant;
    }
  };

  return (
    <motion.div
      initial={getInitialVariant(direction)}
      whileInView={{
        opacity: 1,
        y: direction === "up" || direction === "down" ? 0 : undefined,
        x: direction === "left" || direction === "right" ? 0 : undefined,
      }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      viewport={{ once: false, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}