"use client";

import { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface PathData {
  points: Point[];
  offset: number;
}

export default function BackgroundBeams() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const pathsRef = useRef<PathData[]>([]);
  const animationRef = useRef<number | null>(null);

  // Initialize paths with random control points
  const initializePaths = (w: number, h: number) => {
    const paths: PathData[] = [];
    const numPaths = 7;

    for (let i = 0; i < numPaths; i++) {
      const points: Point[] = [];
      const numPoints = 6;

      for (let j = 0; j < numPoints; j++) {
        points.push({
          x: (w / numPoints) * j,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
        });
      }

      paths.push({
        points,
        offset: 0,
      });
    }

    pathsRef.current = paths;
  };

  // Spring physics towards cursor
  const applySpringForce = (
    point: Point,
    targetX: number,
    targetY: number,
    influence: number
  ) => {
    const dx = targetX - point.x;
    const dy = targetY - point.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 200) {
      const force = Math.max(0, 1 - distance / 200);
      point.vx += dx * 0.03 * force * influence;
      point.vy += dy * 0.03 * force * influence;
    }

    // Damping
    point.vx *= 0.92;
    point.vy *= 0.92;

    point.x += point.vx;
    point.y += point.vy;
  };

  // Generate SVG path string from points
  const generatePathString = (points: Point[]) => {
    if (points.length < 2) return "";

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const xMid = (points[i - 1].x + points[i].x) / 2;
      const yMid = (points[i - 1].y + points[i].y) / 2;

      path += ` Q ${points[i - 1].x} ${points[i - 1].y} ${xMid} ${yMid}`;
    }

    path += ` T ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    return path;
  };

  // Animation loop
  const animate = () => {
    pathsRef.current.forEach((pathData) => {
      pathData.points.forEach((point, idx) => {
        // Slight vertical oscillation for natural movement
        const baseY =
          dimensions.height * (0.2 + (idx / pathData.points.length) * 0.6);
        point.y +=
          Math.sin(Date.now() * 0.0005 + idx) * 0.1 -
          (point.y - baseY) * 0.002;

        // Apply spring force towards cursor
        applySpringForce(point, mousePos.x, mousePos.y, 0.5);

        // Keep within bounds
        point.y = Math.max(0, Math.min(dimensions.height, point.y));
      });
    });

    // Update SVG
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path, idx) => {
        if (pathsRef.current[idx]) {
          path.setAttribute(
            "d",
            generatePathString(pathsRef.current[idx].points)
          );
        }
      });
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    setMousePos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Handle resize
  const handleResize = () => {
    if (svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      initializePaths(width, height);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: "transparent" }}
    >
      {[...Array(7)].map((_, i) => (
        <path
          key={i}
          stroke="#e2e8f0"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="10, 5"
          opacity="0.6"
          style={{
            filter: "blur(0.5px)",
          }}
        />
      ))}
    </svg>
  );
}