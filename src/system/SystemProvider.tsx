"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { BASE_CONFIG, merge, toCSSVars, type SystemConfig } from "./tokens";
import { setMotionScale } from "./motion";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface Decision {
  id: number;
  time: string;
  token: string;
  from: string;
  to: string;
  source: string;
}

const TOKEN_NAME: Partial<Record<keyof SystemConfig, string>> = {
  mode: "mode",
  contrast: "contrast",
  motion: "motion",
  density: "density",
  brand: "brand",
  platform: "platform",
  radius: "radius.control",
  spaceBase: "space.base",
  typeScale: "type.scale",
  targetMin: "size.target.min",
  iconSize: "size.icon.md",
};

/** Accessibility decisions always resolve last: no scene may override them. */
const A11Y_KEYS: (keyof SystemConfig)[] = ["contrast", "motion", "targetMin"];

interface SystemCtx {
  /** the resolved global system */
  config: SystemConfig;
  user: Partial<SystemConfig>;
  sceneOverride: Partial<SystemConfig> | null;
  osReducedMotion: boolean;
  setUser: (patch: Partial<SystemConfig>, source: string) => void;
  resetUser: (source: string) => void;
  setSceneOverride: (o: Partial<SystemConfig> | null) => void;
  decisions: Decision[];
  record: (token: string, from: string, to: string, source: string) => void;
}

const Ctx = createContext<SystemCtx | null>(null);

export function useSystem() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSystem outside SystemProvider");
  return c;
}

const clock = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export function SystemProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<Partial<SystemConfig>>({});
  const [sceneOverride, setSceneOverride] = useState<Partial<SystemConfig> | null>(null);
  const [osReducedMotion, setOsReduced] = useState(false);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setOsReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const config = useMemo(() => {
    const a11y: Partial<SystemConfig> = {};
    for (const k of A11Y_KEYS) if (user[k] !== undefined) (a11y as Record<string, unknown>)[k] = user[k];
    const motion = user.motion ?? (osReducedMotion ? "reduced" : "full");
    return merge(user, sceneOverride, a11y, { motion });
  }, [user, sceneOverride, osReducedMotion]);

  // The page is a consumer of its own tokens: write them on <html>.
  const applied = useRef<Record<string, string>>({});
  useIsoLayoutEffect(() => {
    const vars = toCSSVars(config);
    const el = document.documentElement;
    for (const [k, val] of Object.entries(vars)) {
      if (applied.current[k] !== val) el.style.setProperty(k, val);
    }
    applied.current = vars;
    el.style.colorScheme = config.mode;
    el.dataset.mode = config.mode;
    el.dataset.contrast = config.contrast;
    el.dataset.motion = config.motion;
    el.dataset.focus = config.focus;
    setMotionScale(config.motion === "reduced" ? 0 : 1);
  }, [config]);

  const record = useCallback((token: string, from: string, to: string, source: string) => {
    if (from === to) return;
    setDecisions((d) => [...d, { id: ++seq.current, time: clock(), token, from, to, source }].slice(-60));
  }, []);

  const userRef = useRef(user);
  userRef.current = user;

  const setUser = useCallback(
    (patch: Partial<SystemConfig>, source: string) => {
      const before = merge(userRef.current);
      for (const [k, val] of Object.entries(patch)) {
        const key = k as keyof SystemConfig;
        const name = TOKEN_NAME[key];
        if (name) record(name, String(before[key]), String(val), source);
      }
      userRef.current = { ...userRef.current, ...patch };
      setUserState(userRef.current);
    },
    [record],
  );

  const resetUser = useCallback(
    (source: string) => {
      setUserState({});
      record("system", "custom", `v${BASE_CONFIG.version} defaults`, source);
    },
    [record],
  );

  const value = useMemo(
    () => ({
      config,
      user,
      sceneOverride,
      osReducedMotion,
      setUser,
      resetUser,
      setSceneOverride,
      decisions,
      record,
    }),
    [config, user, sceneOverride, osReducedMotion, setUser, resetUser, decisions, record],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Re-resolve the system for a subtree. Inherits the global system
 * (so accessibility decisions reach every demo) and overrides the rest.
 */
export function SystemScope({
  config: local,
  children,
  style,
  ...rest
}: { config: Partial<SystemConfig>; children?: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  const { config: global } = useSystem();
  const resolved = useMemo(
    () => merge(global, local, { motion: global.motion, targetMin: Math.max(global.targetMin, local.targetMin ?? 0) }),
    [global, local],
  );
  const vars = useMemo(() => toCSSVars(resolved), [resolved]);
  return (
    <div
      data-scope=""
      data-mode={resolved.mode}
      data-platform={resolved.platform}
      style={{ ...(vars as CSSProperties), colorScheme: resolved.mode, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function useResolvedScope(local: Partial<SystemConfig>) {
  const { config: global } = useSystem();
  return useMemo(() => merge(global, local, { motion: global.motion }), [global, local]);
}
