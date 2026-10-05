"use client";

import { useStepOverride } from "@/hooks/scene";
import { SystemScope } from "@/system/SystemProvider";
import { BRANDS } from "@/system/tokens";
import { App, AXES, PATH, type Cfg } from "../Themes";

/** Phones: the readout *is* the control. Tap an axis to move through it. */
export function ThemesM({ step }: { step: number }) {
  const [cfg, setCfg] = useStepOverride<Cfg>(step, (s) => PATH[s]);
  const cycle = (k: keyof Cfg) => {
    const a = AXES.find((x) => x.key === k)!;
    const i = a.options.indexOf(cfg[k] as string);
    setCfg({ ...cfg, [k]: a.options[(i + 1) % a.options.length] } as Cfg);
  };

  return (
    <div className="m mth">
      <div className="m-top">
        <span className="m-label">system — tap an axis</span>
        <div className="mth-axes">
          {AXES.map((a) => (
            <button key={a.key} type="button" className="mth-axis" onClick={() => cycle(a.key)} aria-label={`${a.label}: ${cfg[a.key]}. Change`}>
              <span className="m-label">{a.label}</span>
              <span className="mth-axis__v">
                {a.key === "brand" ? `${cfg.brand.toUpperCase()} · ${BRANDS[cfg.brand].name}` : a.show(cfg[a.key] as string)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <SystemScope config={cfg} className="m-focus is-top mth-scope scope-surface">
        <App platform={cfg.platform} />
      </SystemScope>

      <div className="m-foot">
        <p className="m-read">
          <span className="t-muted">3 × 2 × 2 × 3 =</span> 36 resolved systems <span className="t-muted">· one component set</span>
        </p>
      </div>
    </div>
  );
}
