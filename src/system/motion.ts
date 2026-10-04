/**
 * motion.duration.* resolves to 0 under reduced motion.
 * JS animations read the same decision through dur(), so CSS and GSAP agree.
 */
let scale = 1;
const listeners = new Set<(s: number) => void>();

export function setMotionScale(s: number) {
  if (s === scale) return;
  scale = s;
  listeners.forEach((l) => l(s));
}

export const motionScale = () => scale;
export const reduced = () => scale === 0;
/** seconds × motion scale */
export const dur = (s: number) => s * scale;

export function onMotionChange(fn: (s: number) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const EASE = {
  structure: "power2.inOut",
  arrive: "power3.out",
  line: "none",
} as const;
