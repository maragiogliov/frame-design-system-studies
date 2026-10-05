"use client";

import { useMemo, type CSSProperties } from "react";
import { SystemScope, useSystem } from "@/system/SystemProvider";
import { contrast, merge, resolveChain, resolveValue, scalars } from "@/system/tokens";
import { Button, Checkbox, Field, Toggle } from "@/ui/kit";
import { PREVIEW } from "../Accessibility";

export function AccessibilityM({ step }: { step: number }) {
  const { config, setUser, osReducedMotion } = useSystem();
  const preview = PREVIEW[step];
  const base = useMemo(() => merge(config, { contrast: "standard", motion: "full", targetMin: 24 }), [config]);
  const now = useMemo(() => merge(config, preview.patch), [config, preview]);

  const line = (() => {
    const prim = (t: string, c: typeof now) => resolveChain(t, c).slice(-1)[0].name;
    const r = (c: typeof now) => contrast(resolveValue("color.text.secondary", c), resolveValue("color.surface.default", c)).toFixed(1);
    if (step === 1) return ["color.text.secondary", `${prim("color.text.secondary", base)} ${r(base)}:1`, `${prim("color.text.secondary", now)} ${r(now)}:1`];
    if (step === 2) return ["motion.duration.base", `${scalars(base)["motion.duration.base"]}ms`, `${scalars(now)["motion.duration.base"]}ms`];
    if (step === 3) return ["size.target.min", `${scalars(base)["size.target.min"]}px`, `${scalars(now)["size.target.min"]}px`];
    return ["color.text.secondary", `${prim("color.text.secondary", base)} ${r(base)}:1`, ""];
  })();

  const motionOverride: CSSProperties | undefined =
    preview.patch.motion === "reduced"
      ? ({ ["--motion-duration-short" as string]: "0ms", ["--motion-duration-base" as string]: "0ms", ["--motion-duration-long" as string]: "0ms" } as CSSProperties)
      : undefined;

  return (
    <div className="m ma11y">
      <div className="m-top">
        <p className="m-title is-sm">
          Not a checklist. <span className="t-accent">A constraint on every layer.</span>
        </p>
      </div>

      <div className="m-focus is-top">
        <span className="m-label">
          preview · <span className="t-accent">{preview.label}</span>
        </span>
        <SystemScope config={preview.patch} className="ma11y-spec scope-surface">
          <div className="ma11y-inner" style={motionOverride}>
            <Field inert label="Card number" value="4242 4242 4242" state="focus" />
            <span className="mp-row">
              <Checkbox inert label="Save card" checked />
              <Toggle inert label="Receipts" checked={step % 2 === 0} />
            </span>
            <span className="mp-row">
              <Button inert>Pay €48.00</Button>
              <Button inert intent="secondary" state="disabled">
                Split
              </Button>
            </span>
          </div>
        </SystemScope>
        <p className="m-read">
          <span className="t-muted">{line[0]}</span> {line[1]}
          {line[2] && <> → <span className="t-accent">{line[2]}</span></>}
        </p>
      </div>

      <div className="m-foot">
        <span className="m-label">apply to the whole study</span>
        <div className="ma11y-switches">
          <Toggle label="High contrast" checked={config.contrast === "high"} onChange={(on) => setUser({ contrast: on ? "high" : "standard" }, "accessibility")} />
          <Toggle
            label="Reduced motion"
            hint={osReducedMotion ? "system setting" : undefined}
            checked={config.motion === "reduced"}
            onChange={(on) => setUser({ motion: on ? "reduced" : "full" }, "accessibility")}
          />
          <Toggle label="Larger targets" checked={config.targetMin >= 44} onChange={(on) => setUser({ targetMin: on ? 44 : 24 }, "accessibility")} />
        </div>
      </div>
    </div>
  );
}
