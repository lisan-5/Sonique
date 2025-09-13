import React, { useRef, useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface CosmicBackdropProps {
  intensity?: number; // number of particles multiplier
}

export const CosmicBackdrop: React.FC<CosmicBackdropProps> = ({ intensity = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();
  const particlesRef = useRef<{x:number;y:number;z:number;vx:number;vy:number;}[]>([]);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const baseCount = prefersReduced ? 40 : 140;
    const count = Math.floor(baseCount * intensity);
    particlesRef.current = Array.from({ length: count }).map(() => ({
      x: Math.random()*width,
      y: Math.random()*height,
      z: Math.random()*0.9 + 0.1,
      vx: (Math.random()-0.5)*0.05,
      vy: (Math.random()-0.5)*0.05,
    }));

    const render = () => {
      ctx.clearRect(0,0,width,height);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particlesRef.current) {
        // Move
        p.x += p.vx * (prefersReduced ? 0.5 : 1);
        p.y += p.vy * (prefersReduced ? 0.5 : 1);
        // Wrap
        if (p.x < 0) p.x += width; else if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height; else if (p.y > height) p.y -= height;
        const size = (1.5 + p.z*2) * (prefersReduced ? 0.6 : 1);
        const alpha = 0.15 + p.z*0.35;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size*4);
        gradient.addColorStop(0, `rgba(168,85,247,${alpha})`);
        gradient.addColorStop(0.6, `rgba(236,72,153,${alpha*0.3})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size*4, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };
    if (!prefersReduced) {
      render();
    } else {
      // Static simplified background for reduced motion
      ctx.fillStyle = '#0f0d17';
      ctx.fillRect(0,0,width,height);
      for (const p of particlesRef.current) {
        ctx.fillStyle = 'rgba(168,85,247,0.25)';
        ctx.fillRect(p.x, p.y, 2, 2);
      }
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity, prefersReduced]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" aria-hidden="true" />;
};
