"use client";
/**
 * 404: a black screen where a light trail searches for the page. The pointer steers a glowing "probe"
 * that leaves a fading trail behind it (canvas, paused offscreen, static under reduced motion).
 */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealTitle, reducedMotion } from "@/components/v3/motion";
import { l, useTranslation } from "@/lib/i18n";

const C = {
  kicker: l("error 404", "erreur 404"),
  title: l("this bond", "cette obligation"), accent: l("has matured", "est arrivée à échéance"),
  lead: l("the page you are looking for does not exist, or it moved.", "la page que vous cherchez n’existe pas, ou elle a été déplacée."),
  home: l("back to home", "retour à l’accueil"), strategies: l("our strategies", "nos stratégies"),
};

function Trail() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0, raf = 0, t0 = performance.now();
    const pts: { x: number; y: number }[] = [];
    const target = { x: 0.5, y: 0.6, active: false };
    const size = () => { const r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * dpr; c.height = H * dpr; };
    size();
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      // autopilot: a slow lissajous when the pointer is away
      const ax = 0.5 + 0.36 * Math.sin(t * 0.55), ay = 0.62 + 0.16 * Math.sin(t * 1.1 + 1);
      const tx = target.active ? target.x : ax, ty = target.active ? target.y : ay;
      const last = pts[pts.length - 1] ?? { x: tx * W, y: ty * H };
      pts.push({ x: last.x + (tx * W - last.x) * 0.08, y: last.y + (ty * H - last.y) * 0.08 });
      if (pts.length > 90) pts.shift();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (let i = 1; i < pts.length; i++) {
        const k = i / pts.length;
        ctx.strokeStyle = `rgba(${Math.round(26 + 53 * k)},${Math.round(115 + 94 * k)},${Math.round(232 + 23 * k)},${k * 0.9})`;
        ctx.lineWidth = 1 + k * 6;
        ctx.shadowColor = "rgba(79,209,255,.9)"; ctx.shadowBlur = 16 * k;
        ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
      }
      const p = pts[pts.length - 1];
      ctx.shadowBlur = 30; ctx.fillStyle = "#e8f4ff";
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    if (reducedMotion()) { for (let i = 0; i < 90; i++) draw(t0 + i * 16); cancelAnimationFrame(raf); return; }
    raf = requestAnimationFrame(draw);
    const host = c.parentElement!;
    const move = (e: PointerEvent) => { const r = c.getBoundingClientRect(); target.x = (e.clientX - r.left) / r.width; target.y = (e.clientY - r.top) / r.height; target.active = true; };
    const leave = () => { target.active = false; };
    const onVis = () => { cancelAnimationFrame(raf); if (document.visibilityState === "visible") raf = requestAnimationFrame(draw); };
    host.addEventListener("pointermove", move); host.addEventListener("pointerleave", leave);
    window.addEventListener("resize", size); document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave); window.removeEventListener("resize", size); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  return <canvas ref={ref} className="nf-canvas" aria-hidden="true" />;
}

export function NotFoundScreen() {
  const { pick } = useTranslation();
  return (
    <div className="stage">
      <section className="screen dark center nf" aria-labelledby="nf-t">
        <Trail />
        <span className="nf-404 g-blue" aria-hidden="true">404</span>
        <div className="wrap narrow">
          <Reveal className="kicker" self><span className="mark" aria-hidden="true" />{pick(C.kicker)}</Reveal>
          <RevealTitle as="h1" id="nf-t" text={pick(C.title)} accent={pick(C.accent)} className="h1" breakBeforeAccent />
          <Reveal as="p" className="lead" self delay={400}>{pick(C.lead)}</Reveal>
          <Reveal className="cta-row" delay={600} stagger={120}>
            <Link className="btn" href="/">{pick(C.home)} <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link className="btn ghost" href="/strategies">{pick(C.strategies)}</Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
