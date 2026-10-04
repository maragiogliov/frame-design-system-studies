"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { ScrollTrigger, useGSAP } from "@/system/gsap";
import { SCENES } from "@/presentation/scenes";

/* --------------------------------------------------------- active scene */

let active = "intro";
const subs = new Set<() => void>();
function setActive(id: string) {
  if (id === active) return;
  active = id;
  subs.forEach((s) => s());
}
export function useActiveScene() {
  return useSyncExternalStore(
    (cb) => (subs.add(cb), () => subs.delete(cb)),
    () => active,
    () => "intro",
  );
}

/* ---------------------------------------------------------------- scene */

export interface SceneApi {
  step: number;
  /** true while the scroll position is inside the scene's range */
  active: boolean;
  /** live 0–1 progress through the pinned range, without re-rendering */
  progress: RefObject<number>;
  section: RefObject<HTMLElement | null>;
}

/**
 * A scene is a state machine whose input is scroll.
 * Pinned scenes: sticky stage, ScrollTrigger progress → discrete step.
 */
export function Scene({
  id,
  children,
  className,
  stageClassName,
  label,
}: {
  id: string;
  children: (api: SceneApi) => ReactNode;
  className?: string;
  stageClassName?: string;
  /** accessible summary of what the scene demonstrates */
  label?: string;
}) {
  const meta = SCENES.find((s) => s.id === id)!;
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  const [inRange, setInRange] = useState(false);

  useGSAP(
    () => {
      const el = section.current!;
      const toStep = (p: number) => Math.min(meta.steps - 1, Math.max(0, Math.floor(p * meta.steps)));
      ScrollTrigger.create({
        id: `scene-${id}`,
        trigger: el,
        start: "top top",
        end: meta.pinned ? "bottom bottom" : () => `+=${Math.max(1, el.offsetHeight - window.innerHeight)}`,
        onUpdate(self) {
          progress.current = self.progress;
          if (meta.pinned) setStep(toStep(self.progress));
        },
        onRefresh(self) {
          progress.current = self.progress;
          if (meta.pinned) setStep(toStep(self.progress));
          setInRange(self.isActive);
        },
        onToggle(self) {
          setInRange(self.isActive);
        },
      });
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle(self) {
          if (self.isActive) setActive(id);
        },
      });
    },
    { scope: section },
  );

  const api: SceneApi = { step, active: inRange, progress, section };
  const heightStyle = meta.pinned ? { height: `${(meta.length + 1) * 100}svh` } : undefined;

  return (
    <section
      id={id}
      ref={section}
      className={`scene ${className ?? ""}`}
      style={heightStyle}
      aria-labelledby={`${id}-title`}
      data-step={step}
    >
      {meta.pinned ? (
        <div className={`stage ${stageClassName ?? ""}`}>
          <SceneHead id={id} step={step} steps={meta.steps} />
          {label && <p className="sr-only">{label}</p>}
          {children(api)}
        </div>
      ) : (
        <div className={`flow ${stageClassName ?? ""}`}>
          <SceneHead id={id} />
          {label && <p className="sr-only">{label}</p>}
          {children(api)}
        </div>
      )}
    </section>
  );
}

function SceneHead({ id, step, steps }: { id: string; step?: number; steps?: number }) {
  const meta = SCENES.find((s) => s.id === id)!;
  return (
    <header className="scene-head">
      <span className="scene-head__index">{meta.index}</span>
      <h2 id={`${id}-title`} className="scene-head__title">
        {meta.title}
      </h2>
      <span className="scene-head__rule" aria-hidden="true" />
      {steps && steps > 1 && (
        <span className="scene-head__step t-num" aria-hidden="true">
          {String((step ?? 0) + 1).padStart(2, "0")}/{String(steps).padStart(2, "0")}
        </span>
      )}
    </header>
  );
}

/** A user choice that holds until the scroll step changes again. */
export function useStepOverride<T>(step: number, fromStep: (s: number) => T) {
  const [manual, setManual] = useState<{ step: number; value: T } | null>(null);
  const value = manual && manual.step === step ? manual.value : fromStep(step);
  return [value, (v: T) => setManual({ step, value: v })] as const;
}

/** media query as state (for recomposing, not shrinking) */
export function useMedia(query: string, initial = false) {
  const [m, setM] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}
export const useDesktop = () => useMedia("(min-width: 64rem)", true);
