"use client";

import { useEffect, useRef, useState } from "react";
import { Scene, useStepOverride } from "@/hooks/scene";
import { SystemScope } from "@/system/SystemProvider";
import { gsap } from "@/system/gsap";
import { dur } from "@/system/motion";
import { BRANDS, type Brand, type Density, type Mode, type Platform } from "@/system/tokens";
import { Button, Field, Icon, Toggle } from "@/ui/kit";

interface Cfg {
  brand: Brand;
  mode: Mode;
  density: Density;
  platform: Platform;
}

const PATH: Cfg[] = [
  { brand: "a", mode: "light", density: "comfortable", platform: "web" },
  { brand: "a", mode: "dark", density: "comfortable", platform: "web" },
  { brand: "a", mode: "dark", density: "compact", platform: "web" },
  { brand: "b", mode: "dark", density: "compact", platform: "web" },
  { brand: "b", mode: "dark", density: "compact", platform: "ios" },
  { brand: "b", mode: "light", density: "compact", platform: "android" },
  { brand: "c", mode: "light", density: "comfortable", platform: "android" },
  { brand: "c", mode: "dark", density: "comfortable", platform: "ios" },
];

const AXES: { key: keyof Cfg; label: string; options: string[]; show: (v: string) => string }[] = [
  { key: "brand", label: "brand", options: ["a", "b", "c"], show: (v) => `brand ${v.toUpperCase()}` },
  { key: "mode", label: "mode", options: ["light", "dark"], show: (v) => v },
  { key: "density", label: "density", options: ["comfortable", "compact"], show: (v) => v },
  { key: "platform", label: "platform", options: ["web", "ios", "android"], show: (v) => (v === "ios" ? "iOS" : v === "android" ? "Android" : "web") },
];

const idx = (c: Cfg) => {
  const row = ["a", "b", "c"].indexOf(c.brand) * 2 + (c.mode === "dark" ? 1 : 0);
  const col = (c.density === "compact" ? 1 : 0) * 3 + ["web", "ios", "android"].indexOf(c.platform);
  return [row, col] as const;
};

export function Themes() {
  return (
    <Scene
      id="themes"
      label="A single interface resolves across four axes — brand, mode, density and platform — 36 configurations in all. Each step changes one axis and the whole interface resolves again."
    >
      {({ step }) => <ThemesStage step={step} />}
    </Scene>
  );
}

function ThemesStage({ step }: { step: number }) {
  const [cfg, setCfg] = useStepOverride<Cfg>(step, (s) => PATH[s]);
  const prev = useRef(cfg);
  const [changed, setChanged] = useState<keyof Cfg | undefined>();
  const readout = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const k = (Object.keys(cfg) as (keyof Cfg)[]).find((key) => prev.current[key] !== cfg[key]);
    prev.current = cfg;
    if (!k || !readout.current) return;
    setChanged(k);
    const row = readout.current.querySelector(`[data-axis="${k}"] dd`);
    if (row) gsap.fromTo(row, { color: "var(--color-action-text)" }, { color: "var(--color-text-primary)", duration: dur(1.2), ease: "power2.out" });
  }, [cfg]);

  const visited = PATH.slice(0, step + 1).map(idx);
  const [cr, cc] = idx(cfg);
  const cell = 16;

  return (
    <div className="th">
      <div className="th-left">
        <p className="th-readout__head t-mono">System:</p>
        <dl ref={readout} className="th-readout t-mono" aria-live="polite">
          {AXES.map((a) => (
            <div key={a.key} data-axis={a.key} data-changed={a.key === changed}>
              <dt>{a.label}</dt>
              <dd>{a.key === "brand" ? `${cfg.brand.toUpperCase()} · ${BRANDS[cfg.brand].name}` : a.show(cfg[a.key]).toUpperCase()}</dd>
            </div>
          ))}
        </dl>

        <div className="th-rails">
          {AXES.map((a) => (
            <div key={a.key} className="th-rail" role="group" aria-label={a.label}>
              <span className="t-label">{a.label}</span>
              {a.options.map((o) => (
                <button key={o} type="button" className="ctl" aria-pressed={cfg[a.key] === o} onClick={() => setCfg({ ...cfg, [a.key]: o })}>
                  {a.show(o)}
                </button>
              ))}
            </div>
          ))}
        </div>

        <figure className="th-space">
          <svg width={cell * 6 + 2} height={cell * 6 + 2} aria-hidden="true">
            {Array.from({ length: 36 }, (_, i) => {
              const r = Math.floor(i / 6);
              const c = i % 6;
              const seen = visited.some(([vr, vc]) => vr === r && vc === c);
              return <rect key={i} x={c * cell + 4} y={r * cell + 4} width={cell - 8} height={cell - 8} className="th-cell" data-seen={seen} />;
            })}
            <polyline
              className="th-path"
              points={visited.map(([r, c]) => `${c * cell + cell / 2},${r * cell + cell / 2}`).join(" ")}
            />
            <rect x={cc * cell + 1} y={cr * cell + 1} width={cell - 2} height={cell - 2} className="th-now" />
          </svg>
          <figcaption className="t-mono t-muted">
            3 brands × 2 modes × 2 densities × 3 platforms = <b>36</b> resolved systems.
            <br />
            One component set. Visited: {visited.length}.
          </figcaption>
        </figure>
      </div>

      <div className="th-right">
        <SystemScope config={cfg} className="th-scope scope-surface" data-density={cfg.density}>
          <App platform={cfg.platform} />
        </SystemScope>
        <p className="t-essay th-caption">
          {step === 0 && "Nothing in this interface knows which brand, mode, density or platform it is in."}
          {step > 0 && changed && (
            <>
              <em>{changed}</em> changed. Every token that depends on it resolved again. The components did not change.
            </>
          )}
          {step > 0 && !changed && "Tap an axis. The interface resolves, it is not redrawn."}
        </p>
      </div>
    </div>
  );
}

function App({ platform }: { platform: Platform }) {
  return (
    <div className="th-app" data-platform={platform}>
      <div className="th-bar">
        {platform !== "web" && <Icon name="back" />}
        <span className="th-bar__title">Notifications</span>
        {platform === "web" && (
          <span className="th-bar__crumb t-muted">
            Settings <Icon name="chevron" /> Notifications
          </span>
        )}
      </div>
      <div className="th-body">
        <span className="th-group t-label">Delivery</span>
        <div className="th-list">
          <Toggle inert label="Push notifications" checked hint="On this device" />
          <Toggle inert label="Email summary" hint="Mondays" />
          <Toggle inert label="Mentions only" checked />
        </div>
        <span className="th-group t-label">Quiet hours</span>
        <Field inert value="22:00 – 07:00" icon="bell" />
        <div className="th-actions">
          <Button inert>Save</Button>
          {platform === "web" && (
            <Button inert intent="secondary">
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
