"use client";

import { gsap } from "./gsap";
import { dur, reduced } from "./motion";

/**
 * Propagation made visible. Each consumer of a changed token is marked
 * in order of distance from the cause — the delay *is* the dependency path.
 * Under reduced motion: no travel, a static outline for a moment.
 */
export function pulse(targets: Element[], origin?: Element | null, speed = 1600) {
  if (!targets.length) return;
  const or = (origin ?? targets[0]).getBoundingClientRect();
  const ox = or.left + or.width / 2;
  const oy = or.top + or.height / 2;

  if (reduced()) {
    targets.forEach((t) => t.classList.add("flagged"));
    window.setTimeout(() => targets.forEach((t) => t.classList.remove("flagged")), 1100);
    return;
  }

  for (const t of targets) {
    const r = t.getBoundingClientRect();
    const d = Math.hypot(r.left + r.width / 2 - ox, r.top + r.height / 2 - oy);
    (t as HTMLElement).dataset.pulse = "";
    gsap.fromTo(
      t,
      { "--pulse": "0px" },
      {
        keyframes: [
          { "--pulse": "6px", duration: dur(0.12), ease: "power2.out" },
          { "--pulse": "0px", duration: dur(0.6), ease: "power2.in" },
        ],
        delay: Math.min(d / speed, 0.9),
        overwrite: true,
      },
    );
  }
}

/** All consumers of a token inside a root, read from the DOM. */
export function consumers(root: ParentNode | null, token: string) {
  if (!root) return [] as Element[];
  return Array.from(root.querySelectorAll(`[data-token~="${token}"]`));
}
