"use client";
/**
 * Team portrait: the photo hotlinked from www.nymbus.ca (allowed by the CSP img-src), or the person's
 * initials on a soft gradient disc when there is no photo or it fails to load (also before hydration).
 */
import { useEffect, useRef, useState } from "react";
import type { TeamMember } from "@/data/team";
import { initialsOf } from "./lib/people";

export function Portrait({ m, size = "m", className }: { m: TeamMember; size?: "s" | "m" | "l"; className?: string }) {
  const [broken, setBroken] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // an image that failed before hydration never fires onError: check once mounted
  useEffect(() => {
    const i = img.current;
    if (i && i.complete && i.naturalWidth === 0) setBroken(true);
  }, []);
  return (
    <span className={`pg-pt pg-pt-${size} ${className ?? ""}`} style={{ ["--pc" as string]: m.color }}>
      {m.photo && !broken ? (
        <img ref={img} src={m.photo} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} />
      ) : (
        <span className="pg-pt-i" aria-hidden="true">{initialsOf(m)}</span>
      )}
    </span>
  );
}
