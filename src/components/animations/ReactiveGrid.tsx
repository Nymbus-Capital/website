"use client";

import { useEffect, useRef, useState } from "react";

interface Dot {
  x: number;
  y: number;
  distance: number;
}

export default function ReactiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const dotsRef = useRef<Dot[]>([]);
  const animationRef = useRef<number | null>(null);

  const DOT_RADIUS = 1.5;
  const GRID_SPACING = 40;
  const INFLUENCE_RADIUS = 150;

  // Initialize grid dots
  const initializeDots = (width: number, height: number) => {
    const dots: Dot[] = [];
    for (let x = 0; x < width; x += GRID_SPACING) {
      for (let y = 0; y < height; y += GRID_SPACING) {
        dots.push({ x, y, distance: 999 });
      }
    }
    dotsRef.current = dots;
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw dots
    dotsRef.current.forEach((dot) => {
      // Calculate distance to mouse
      const dx = mousePos.x - dot.x;
      const dy = mousePos.y - dot.y;
      dot.distance = Math.sqrt(dx * dx + dy * dy);

      // Draw dot with glow based on proximity
      if (dot.distance < INFLUENCE_RADIUS) {
        const influence = 1 - dot.distance / INFLUENCE_RADIUS;
        const opacity = Math.min(1, 0.3 + influence * 0.7);

        // Glow effect
        ctx.fillStyle = `rgba(66, 133, 244, ${opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS + influence * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Base dot
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setMousePos({ x: -999, y: -999 });
  };

  // Handle resize
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    initializeDots(width, height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    initializeDots(width, height);

    // Event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: "white" }}
    />
  );
}