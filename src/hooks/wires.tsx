"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { dur } from "@/system/motion";

/**
 * Wires connect a cause to its consequences. They are measured from the real
 * layout (not drawn by hand), so when the layout reflows, the relationships follow.
 */

export interface WireSpec {
  key: string;
  /** selector inside the container */
  from: string;
  to: string;
  on?: boolean;
  tone?: "action" | "strong" | "faint";
  route?: "auto" | "h" | "v" | "curve" | "straight" | "loop";
  dashed?: boolean;
  /** where on the target to attach: default nearest edge */
  toSide?: "top" | "bottom" | "left" | "right";
  fromSide?: "top" | "bottom" | "left" | "right";
  dot?: boolean;
  /** where the elbow turns, 0–1 along the main axis (gives each source its own bus) */
  bend?: number;
  /** fixed elbow distance from the source, px (a shared trunk) */
  trunk?: number;
}

interface Path {
  key: string;
  d: string;
  on: boolean;
  tone?: string;
  dashed?: boolean;
  end?: [number, number];
}

function anchor(r: DOMRect, side: "top" | "bottom" | "left" | "right") {
  switch (side) {
    case "top":
      return [r.left + r.width / 2, r.top] as const;
    case "bottom":
      return [r.left + r.width / 2, r.bottom] as const;
    case "left":
      return [r.left, r.top + r.height / 2] as const;
    case "right":
      return [r.right, r.top + r.height / 2] as const;
  }
}

function build(a: DOMRect, b: DOMRect, s: WireSpec): { d: string; end: [number, number] } {
  if (s.route === "loop") {
    const r1 = (n: number) => Math.round(n * 10) / 10;
    const x1 = a.left - 4,
      y1 = a.top + a.height / 2,
      x2 = b.left - 4,
      y2 = b.top + b.height / 2;
    const k = 14 + Math.abs(y2 - y1) * 0.18;
    return { d: `M${r1(x1)} ${r1(y1)}C${r1(x1 - k)} ${r1(y1)} ${r1(x2 - k)} ${r1(y2)} ${r1(x2)} ${r1(y2)}`, end: [x2, y2] };
  }
  const acx = a.left + a.width / 2;
  const acy = a.top + a.height / 2;
  const bcx = b.left + b.width / 2;
  const bcy = b.top + b.height / 2;
  const horizontal =
    s.route === "h" || (s.route !== "v" && Math.abs(bcx - acx) - (a.width + b.width) / 2 > Math.abs(bcy - acy) - (a.height + b.height) / 2);
  const fromSide = s.fromSide ?? (horizontal ? (bcx > acx ? "right" : "left") : bcy > acy ? "bottom" : "top");
  const toSide = s.toSide ?? (horizontal ? (bcx > acx ? "left" : "right") : bcy > acy ? "top" : "bottom");
  const [x1, y1] = anchor(a, fromSide);
  const [x2, y2] = anchor(b, toSide);
  const r = (n: number) => Math.round(n * 10) / 10;
  if (s.route === "straight") return { d: `M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}`, end: [x2, y2] };
  if (s.route === "curve") {
    const k = horizontal ? Math.abs(x2 - x1) * 0.5 : Math.abs(y2 - y1) * 0.5;
    const c = horizontal
      ? `C${r(x1 + Math.sign(x2 - x1) * k)} ${r(y1)} ${r(x2 - Math.sign(x2 - x1) * k)} ${r(y2)}`
      : `C${r(x1)} ${r(y1 + Math.sign(y2 - y1) * k)} ${r(x2)} ${r(y2 - Math.sign(y2 - y1) * k)}`;
    return { d: `M${r(x1)} ${r(y1)}${c} ${r(x2)} ${r(y2)}`, end: [x2, y2] };
  }
  const vFirst = fromSide === "top" || fromSide === "bottom";
  if (vFirst) {
    const endsV = toSide === "top" || toSide === "bottom";
    if (endsV) {
      const my = y1 + (y2 - y1) * (s.bend ?? 0.5);
      return { d: `M${r(x1)} ${r(y1)}V${r(my)}H${r(x2)}V${r(y2)}`, end: [x2, y2] };
    }
    return { d: `M${r(x1)} ${r(y1)}V${r(y2)}H${r(x2)}`, end: [x2, y2] };
  }
  const endsH = toSide === "left" || toSide === "right";
  if (endsH) {
    const mx = s.trunk != null ? x1 + Math.sign(x2 - x1) * s.trunk : x1 + (x2 - x1) * (s.bend ?? 0.5);
    return { d: `M${r(x1)} ${r(y1)}H${r(mx)}V${r(y2)}H${r(x2)}`, end: [x2, y2] };
  }
  return { d: `M${r(x1)} ${r(y1)}H${r(x2)}V${r(y2)}`, end: [x2, y2] };
}

export function useWires(container: RefObject<HTMLElement | null>, specs: WireSpec[], watch: unknown = null) {
  const [paths, setPaths] = useState<Path[]>([]);
  const specsRef = useRef(specs);
  specsRef.current = specs;
  const sig = specs.map((s) => `${s.key}:${s.on ? 1 : 0}:${s.from}>${s.to}:${s.tone}`).join("|");

  const measure = useCallback(() => {
    const c = container.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    const out: Path[] = [];
    for (const s of specsRef.current) {
      const a = c.querySelector(s.from);
      const b = c.querySelector(s.to);
      if (!a || !b) continue;
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      if (!ar.width && !ar.height) continue;
      const rel = (r: DOMRect) => new DOMRect(r.left - cr.left, r.top - cr.top, r.width, r.height);
      const { d, end } = build(rel(ar), rel(br), s);
      out.push({ key: s.key, d, on: s.on ?? true, tone: s.tone, dashed: s.dashed, end: s.dot ? end : undefined });
    }
    setPaths(out);
  }, [container]);

  useLayoutEffect(() => {
    measure();
    const t1 = window.setTimeout(measure, dur(0.4) * 1000 + 40);
    const t2 = window.setTimeout(measure, dur(0.9) * 1000 + 60);
    return () => (clearTimeout(t1), clearTimeout(t2));
  }, [sig, watch, measure]);

  useEffect(() => {
    const c = container.current;
    if (!c) return;
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(c);
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule);
    return () => (ro.disconnect(), window.removeEventListener("resize", schedule), cancelAnimationFrame(raf));
  }, [container, measure]);

  return { paths, measure };
}

export function WireLayer({ paths, className }: { paths: Path[]; className?: string }) {
  // A wire that appears (or re-routes to a new target) draws itself in.
  const [ready, setReady] = useState<Set<string>>(() => new Set());
  const keys = paths.map((p) => p.key).join("|");
  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(new Set(keys.split("|")))),
    );
    return () => cancelAnimationFrame(raf);
  }, [keys]);
  return (
    <svg className={`wires ${className ?? ""}`} aria-hidden="true">
      {paths.map((p) => (
        <path
          key={p.key}
          d={p.d}
          pathLength={1}
          className="wire"
          data-on={p.on && ready.has(p.key) ? "true" : "false"}
          data-tone={p.tone}
          data-dashed={p.dashed ? "true" : undefined}
        />
      ))}
      {paths.map((p) =>
        p.end && p.on ? (
          <circle
            key={`${p.key}-dot`}
            cx={p.end[0]}
            cy={p.end[1]}
            r={2.5}
            className="wire-dot"
            style={{ color: p.tone === "action" ? "var(--color-action-primary)" : "var(--color-text-secondary)" }}
          />
        ) : null,
      )}
    </svg>
  );
}
