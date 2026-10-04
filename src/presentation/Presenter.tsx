"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/system/gsap";
import { reduced } from "@/system/motion";
import { presentationScenes, totalDuration, type Stop } from "./scenes";

/**
 * Presentation mode moves the real document scroll position, stop by stop.
 * It never animates a scene: ScrollTrigger remains the only animation system,
 * so autoplay and manual scrolling produce identical choreography.
 */

type Mode = "off" | "playing" | "paused";

interface FlatStop extends Stop {
  sceneId: string;
  sceneIndex: number;
  index: string;
  title: string;
  first: boolean;
}

const FLAT: FlatStop[] = presentationScenes.flatMap((s, sceneIndex) =>
  s.stops.map((st, i) => ({ ...st, sceneId: s.id, sceneIndex, index: s.index, title: s.title, first: i === 0 })),
);

function yOf(stop: FlatStop) {
  const st = ScrollTrigger.getById(`scene-${stop.sceneId}`);
  if (!st) return null;
  const end = Math.max(st.start, st.end);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(max, Math.round(st.start + (end - st.start) * stop.at));
}

/** first stop at or after the current scroll position */
function nextFromScroll() {
  const y = window.scrollY;
  const i = FLAT.findIndex((s) => (yOf(s) ?? 0) >= y - 6);
  return i === -1 ? 0 : i;
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.getAttribute("role") === "slider");

export function Presenter() {
  const [mode, setMode] = useState<Mode>("off");
  const [cur, setCur] = useState(0);
  const [live, setLive] = useState("");
  const modeRef = useRef<Mode>("off");
  const idxRef = useRef(0);
  const token = useRef(0);
  const travel = useRef<gsap.core.Tween | null>(null);
  const hold = useRef<gsap.core.Tween | null>(null);
  const bar = useRef<HTMLSpanElement>(null);

  const setM = (m: Mode) => {
    modeRef.current = m;
    setMode(m);
  };

  const stopAll = useCallback(() => {
    token.current++;
    travel.current?.kill();
    hold.current?.kill();
    travel.current = hold.current = null;
    if (bar.current) gsap.killTweensOf(bar.current);
  }, []);

  const pause = useCallback(() => {
    if (modeRef.current !== "playing") return;
    stopAll();
    setM("paused");
    setLive("Presentation paused.");
  }, [stopAll]);

  const exit = useCallback(() => {
    stopAll();
    if (bar.current) gsap.set(bar.current, { scaleX: 0 });
    setM("off");
    setLive("Presentation ended.");
  }, [stopAll]);

  const goTo = useCallback(
    (i: number, continueAfter: boolean) => {
      stopAll();
      const t = token.current;
      const stop = FLAT[i];
      const y = yOf(stop);
      if (y == null) return;
      idxRef.current = i;
      setCur(i);
      if (bar.current) gsap.set(bar.current, { scaleX: 0 });

      const arrive = () => {
        if (t !== token.current) return;
        if (stop.first || stop.caption) setLive(`${stop.index} ${stop.title}. ${stop.caption ?? ""}`);
        if (!continueAfter || modeRef.current !== "playing") return;
        const h = stop.hold * (reduced() ? 1.4 : 1);
        if (bar.current) gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: h, ease: "none" });
        hold.current = gsap.delayedCall(h, () => {
          if (t !== token.current) return;
          if (i + 1 < FLAT.length) goTo(i + 1, true);
          else exit();
        });
      };

      const seconds = reduced() ? 0 : continueAfter ? stop.travel : Math.min(stop.travel, 1.4);
      if (seconds === 0 || Math.abs(window.scrollY - y) < 2) {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
        requestAnimationFrame(arrive);
        return;
      }
      travel.current = gsap.to(window, {
        duration: seconds,
        ease: "power2.inOut",
        scrollTo: { y, autoKill: true, onAutoKill: () => pause() },
        onComplete: arrive,
      });
    },
    [stopAll, pause, exit],
  );

  const play = useCallback(
    (from?: number) => {
      setM("playing");
      const i = from ?? nextFromScroll();
      goTo(i, true);
    },
    [goTo],
  );

  const toggle = useCallback(() => {
    if (modeRef.current === "playing") pause();
    else play();
  }, [pause, play]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const here = modeRef.current === "playing" ? idxRef.current : Math.max(0, nextFromScroll() - (dir > 0 ? 0 : 0));
      const scene = FLAT[here].sceneIndex;
      let target: number;
      if (dir > 0) {
        target = FLAT.findIndex((s) => s.sceneIndex === scene + 1 && s.first);
      } else {
        const firstOfScene = FLAT.findIndex((s) => s.sceneIndex === scene && s.first);
        const y = yOf(FLAT[firstOfScene]) ?? 0;
        target =
          window.scrollY > y + 8 ? firstOfScene : FLAT.findIndex((s) => s.sceneIndex === Math.max(0, scene - 1) && s.first);
      }
      if (target < 0) return;
      goTo(target, modeRef.current === "playing");
    },
    [goTo],
  );

  /* keyboard: only while presentation mode is on */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modeRef.current === "off" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;
      const onControl = e.target instanceof HTMLElement && e.target.closest("button, a, [role=switch]");
      switch (e.key) {
        case " ":
          if (onControl) return; // native activation; the presenter's own button toggles itself
          e.preventDefault();
          toggle();
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          step(1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          step(-1);
          break;
        case "Escape":
          exit();
          break;
        case "PageUp":
        case "PageDown":
        case "Home":
        case "End":
          pause();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, step, exit, pause]);

  /* the user always wins: wheel, touch, scrollbar → pause, never resume */
  useEffect(() => {
    if (mode !== "playing") return;
    const stop = () => pause();
    const onDown = (e: PointerEvent) => {
      if (e.clientX >= document.documentElement.clientWidth || e.target === document.documentElement) pause();
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("study:interrupt", stop);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("study:interrupt", stop);
    };
  }, [mode, pause]);

  /* replay from the finale */
  useEffect(() => {
    const onReplay = () => {
      stopAll();
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      requestAnimationFrame(() => play(0));
    };
    window.addEventListener("study:replay", onReplay);
    return () => window.removeEventListener("study:replay", onReplay);
  }, [play, stopAll]);

  useEffect(() => () => stopAll(), [stopAll]);

  const s = FLAT[cur];
  const minutes = Math.round(totalDuration / 60);

  return (
    <div className="presenter" role="group" aria-label="Presentation">
      <span ref={bar} className="presenter__hold" aria-hidden="true" />
      {mode === "off" ? (
        <>
          <span className="presenter__meta" aria-hidden="true">
            ≈{minutes} min
          </span>
          <button type="button" onClick={() => play()} aria-label={`Present the study, about ${minutes} minutes`}>
            ▶ Present
          </button>
        </>
      ) : (
        <>
          <span className="presenter__meta t-num">
            {mode === "paused" ? "Paused · " : ""}
            {s.index}/{presentationScenes[presentationScenes.length - 1].index}
            <span className="presenter__keys"> · {s.title}</span>
          </span>
          <span className="presenter__meta presenter__keys" aria-hidden="true">
            Space · ←→ · Esc
          </span>
          <button type="button" onClick={toggle} aria-label={mode === "playing" ? "Pause presentation" : "Resume presentation"}>
            {mode === "playing" ? "❚❚" : "▶"}
          </button>
          <button type="button" onClick={exit} aria-label="Exit presentation">
            ✕
          </button>
        </>
      )}
      <span className="sr-only" aria-live="polite">
        {live}
      </span>
    </div>
  );
}
