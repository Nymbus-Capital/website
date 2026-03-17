'use client';

import { useEffect, useRef } from 'react';

const GlobeCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef({ x: 0.5, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = Math.min(500, canvas.width * 0.6);
      }
    };

    setCanvasSize();

    // Montreal coordinates (lat: 45.5, lon: -73.6)
    const montreal = {
      lat: 45.5,
      lon: -73.6,
      label: 'Montreal'
    };

    // Generate globe points using lat/lon grid
    const generateGlobePoints = () => {
      const points: Array<{ x: number; y: number; z: number; lat: number; lon: number; isConnection?: boolean }> = [];

      // Create latitude/longitude grid
      for (let lat = -90; lat <= 90; lat += 15) {
        for (let lon = -180; lon <= 180; lon += 15) {
          // Convert spherical to cartesian
          const phi = (lat * Math.PI) / 180;
          const theta = (lon * Math.PI) / 180;
          const x = Math.cos(phi) * Math.cos(theta);
          const y = Math.sin(phi);
          const z = Math.cos(phi) * Math.sin(theta);

          points.push({ x, y, z, lat, lon });
        }
      }

      // Add connection lines from Montreal
      const montrealPhi = (montreal.lat * Math.PI) / 180;
      const montrealTheta = (montreal.lon * Math.PI) / 180;

      // Calculate Montreal's 3D position
      const montrealX = Math.cos(montrealPhi) * Math.cos(montrealTheta);
      const montrealY = Math.sin(montrealPhi);
      const montrealZ = Math.cos(montrealPhi) * Math.sin(montrealTheta);

      // Add radiating connection points
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 0.7;
        const x = montrealX * 0.8 + Math.cos(angle) * distance * 0.3;
        const y = montrealY;
        const z = montrealZ * 0.8 + Math.sin(angle) * distance * 0.3;

        points.push({ x, y, z, lat: 0, lon: 0, isConnection: true });
      }

      return points;
    };

    const globePoints = generateGlobePoints();

    // Project 3D point to 2D with perspective
    const project = (
      point: { x: number; y: number; z: number },
      rotX: number,
      rotY: number,
      centerX: number,
      centerY: number,
      scale: number
    ) => {
      // Apply rotation matrices
      let x = point.x;
      let y = point.y * Math.cos(rotX) - point.z * Math.sin(rotX);
      let z = point.y * Math.sin(rotX) + point.z * Math.cos(rotX);

      const x2 = x * Math.cos(rotY) + z * Math.sin(rotY);
      z = -x * Math.sin(rotY) + z * Math.cos(rotY);
      x = x2;

      // Perspective projection
      const perspective = 2;
      const scale3d = perspective / (perspective + z);

      return {
        x: centerX + x * scale * scale3d,
        y: centerY + y * scale * scale3d,
        z: z,
        scale3d
      };
    };

    const animate = (time: number) => {
      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.25;

      // Update rotation
      rotationRef.current.y += 0.002;
      rotationRef.current.x = 0.5 + Math.sin(time * 0.0005) * 0.2;

      // Project and draw points
      const projected = globePoints.map(point =>
        project(point, rotationRef.current.x, rotationRef.current.y, centerX, centerY, radius)
      );

      // Sort by z-depth (painter's algorithm)
      projected.sort((a, b) => a.z - b.z);

      // Draw connection lines
      const montrealProj = project(
        {
          x: Math.cos((montreal.lat * Math.PI) / 180) * Math.cos((montreal.lon * Math.PI) / 180),
          y: Math.sin((montreal.lat * Math.PI) / 180),
          z: Math.cos((montreal.lat * Math.PI) / 180) * Math.sin((montreal.lon * Math.PI) / 180)
        },
        rotationRef.current.x,
        rotationRef.current.y,
        centerX,
        centerY,
        radius
      );

      // Draw radiating lines from Montreal
      projected.forEach((p, i) => {
        if (globePoints[i].isConnection) {
          ctx.strokeStyle = `rgba(0, 102, 255, ${0.1 + Math.sin(time * 0.005 + i) * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(montrealProj.x, montrealProj.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      });

      // Draw globe points
      projected.forEach((p, i) => {
        if (!globePoints[i].isConnection) {
          ctx.fillStyle = `rgba(148, 163, 184, ${0.3 + p.scale3d * 0.4})`;
          const size = 1.5 * p.scale3d;
          ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        }
      });

      // Draw Montreal marker (pulsing blue dot)
      const pulseScale = 0.8 + Math.sin(time * 0.01) * 0.2;

      // Outer pulse ring
      ctx.strokeStyle = `rgba(0, 102, 255, ${0.4 - Math.sin(time * 0.01) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(montrealProj.x, montrealProj.y, 8 * pulseScale, 0, Math.PI * 2);
      ctx.stroke();

      // Core dot
      ctx.fillStyle = '#0066FF';
      ctx.beginPath();
      ctx.arc(montrealProj.x, montrealProj.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Montreal label
      ctx.fillStyle = '#0066FF';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Montreal', montrealProj.x, montrealProj.y + 25);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center">
      <canvas
        ref={canvasRef}
        className="w-full max-w-4xl h-auto"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default GlobeCanvas;
