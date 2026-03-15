"use client";

import { ReactNode } from "react";

interface MovingBorderProps {
  children: ReactNode;
  className?: string;
  borderColor?: string;
  duration?: number;
}

export default function MovingBorder({
  children,
  className = "",
  borderColor = "#4285F4",
  duration = 3,
}: MovingBorderProps) {
  return (
    <div
      className={`relative group ${className}`}
      style={{
        "--border-color": borderColor,
        "--duration": `${duration}s`,
      } as React.CSSProperties & { "--border-color": string; "--duration": string }}
    >
      {/* Animated border effect */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, ${borderColor}, #ffffff, ${borderColor})`,
          padding: "2px",
          animation: `rotateBorder var(--duration) linear infinite`,
        }}
      >
        <div className="absolute inset-0 bg-white rounded-lg" />
      </div>

      {/* Content */}
      <div className="relative bg-white rounded-lg p-6 z-10">{children}</div>

      <style jsx>{`
        @keyframes rotateBorder {
          0% {
            --tw-rotate: 0deg;
            transform: rotate(0deg);
          }
          100% {
            --tw-rotate: 360deg;
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}