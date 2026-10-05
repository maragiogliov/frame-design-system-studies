"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Scene , Views } from "@/hooks/scene";
import { AccessibilityM } from "./mobile/AccessibilityM";
import { SystemScope, useSystem } from "@/system/SystemProvider";
import { contrast, merge, resolveChain, resolveValue, scalars, type SystemConfig } from "@/system/tokens";
import { Button, Checkbox, Dialog, Field, Toggle } from "@/ui/kit";

export const PREVIEW: { label: string; patch: Partial<SystemConfig> }[] = [
  { label: "standard", patch: {} },
  { label: "high contrast", patch: { contrast: "high" } },
  { label: "reduced motion", patch: { motion: "reduced" } },
  { label: "larger targets", patch: { targetMin: 44 } },
];

export function Accessibility() {
  return (
    <Scene
      id="accessibility"
      label="Accessibility is not a checklist at the end. High contrast resolves semantic colour tokens from a different map; reduced motion sets every motion duration to zero; larger targets raise the minimum target size. The switches apply to the whole study."
    >
      {({ step }) => <Views desktop={<A11yStage step={step} />} mobile={<AccessibilityM step={step} />} />}
    </Scene>
  );
}

function A11yStage({ step }: { step: number }) {
  const { config, setUser, osReducedMotion } = useSystem();
  const preview = PREVIEW[step];
  const now = useMemo(() => merge(config, preview.patch), [config, preview]);
  const base = useMemo(() => merge(config, { contrast: "standard", motion: "full", targetMin: 24 }), [config]);
  const [labelled, setLabelled] = useState(0);

  useEffect(() => {
    setLabelled(document.querySelectorAll("button[aria-label], [role=switch][aria-label]").length);
  }, [config]);

  const rows = useMemo(() => {
    const ratio = (fg: string, bg: string, c: SystemConfig) => contrast(resolveValue(fg, c), resolveValue(bg, c));
    const prim = (t: string, c: SystemConfig) => resolveChain(t, c).slice(-1)[0].name;
    const r = (c: SystemConfig) => ({
      color: `${prim("color.text.secondary", c)} · ${ratio("color.text.secondary", "color.surface.default", c).toFixed(1)}:1`,
      contrast: `${prim("color.action.primary", c)} · ${ratio("color.text.onAction", "color.action.primary", c).toFixed(1)}:1`,
      focus: `${scalars(c)["focus.ring.width"]}px ${prim("color.focus.ring", c)} · ${ratio("color.focus.ring", "color.surface.default", c).toFixed(1)}:1`,
      motion: `${scalars(c)["motion.duration.base"]}ms`,
      states: `disabled → ${prim("color.text.disabled", c)}, never opacity alone`,
      targets: `${scalars(c)["size.target.min"]}px`,
    });
    const a = r(base);
    const b = r(now);
    return [
      { k: "color", token: "color.text.secondary", a: a.color, b: b.color },
      { k: "contrast", token: "color.text.onAction / action.primary", a: a.contrast, b: b.contrast },
      { k: "focus", token: "focus.ring.width · color.focus.ring", a: a.focus, b: b.focus },
      { k: "motion", token: "motion.duration.base", a: a.motion, b: b.motion },
      { k: "states", token: "color.text.disabled", a: a.states, b: b.states },
      { k: "targets", token: "size.target.min", a: a.targets, b: b.targets },
      { k: "keyboard", token: "rule", a: "Tab order = DOM order; Esc closes; arrows move", b: "same" },
      { k: "content", token: "rule", a: `icon-only actions are named — ${labelled} named controls on this page`, b: "same" },
    ];
  }, [base, now, labelled]);

  const motionOverride: CSSProperties | undefined =
    preview.patch.motion === "reduced"
      ? ({ ["--motion-duration-short" as string]: "0ms", ["--motion-duration-base" as string]: "0ms", ["--motion-duration-long" as string]: "0ms" } as CSSProperties)
      : undefined;

  return (
    <div className="a11y">
      <div className="a11y-left">
        <p className="t-statement a11y-statement">
          Not a checklist.
          <br />
          <span className="t-accent">A constraint on every layer.</span>
        </p>
        <div className="a11y-switches" role="group" aria-label="Apply to the whole study">
          <span className="t-label">apply to the whole study</span>
          <Toggle
            label="High contrast"
            hint="semantic colours resolve from another map"
            checked={config.contrast === "high"}
            onChange={(on) => setUser({ contrast: on ? "high" : "standard" }, "accessibility")}
          />
          <Toggle
            label="Reduced motion"
            hint={osReducedMotion ? "your system asks for this" : "motion.duration.* → 0"}
            checked={config.motion === "reduced"}
            onChange={(on) => setUser({ motion: on ? "reduced" : "full" }, "accessibility")}
          />
          <Toggle
            label="Larger targets"
            hint="size.target.min 24 → 44"
            checked={config.targetMin >= 44}
            onChange={(on) => setUser({ targetMin: on ? 44 : 24 }, "accessibility")}
          />
        </div>
      </div>

      <div className="a11y-right">
        <div className="a11y-preview-label t-label">
          preview · <span className="t-accent">{preview.label}</span>
        </div>
        <SystemScope config={preview.patch} className="a11y-spec scope-surface">
          <div className="a11y-spec__inner" style={motionOverride}>
            <Field label="Card number" value="4242 4242 4242" state="focus" inert />
            <span className="a11y-spec__row">
              <Checkbox inert label="Save for next time" checked />
              <Toggle inert label="Receipts" checked={step % 2 === 0} />
            </span>
            <span className="a11y-spec__row">
              <Button inert>Pay €48.00</Button>
              <Button inert intent="secondary" state="disabled">
                Split
              </Button>
              <Button inert intent="ghost" icon="close" />
            </span>
            <span className="t-mono a11y-spec__hint">secondary text — {rows[0].b}</span>
          </div>
          <div className="a11y-dialog" style={motionOverride}>
            <Dialog title="Remove card?" body="Payments using it will stop." primary="Remove" secondary="Keep" danger />
          </div>
        </SystemScope>

        <table className="a11y-table t-mono">
          <caption className="sr-only">Accessibility decisions resolved across the system</caption>
          <thead>
            <tr>
              <th scope="col">concern</th>
              <th scope="col">token</th>
              <th scope="col">standard</th>
              <th scope="col">{preview.label}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k} data-changed={r.b !== r.a && r.b !== "same"}>
                <th scope="row">{r.k}</th>
                <td className="t-muted">{r.token}</td>
                <td>{r.a}</td>
                <td>{r.b === "same" ? "—" : r.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
