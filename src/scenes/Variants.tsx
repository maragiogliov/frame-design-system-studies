"use client";

import { Scene, useDesktop , Views } from "@/hooks/scene";
import { VariantsM } from "./mobile/VariantsM";
import { SystemScope } from "@/system/SystemProvider";
import { Button, type BtnState, type Intent } from "@/ui/kit";

const SIZES = ["sm", "md", "lg"] as const;
const INTENTS: Intent[] = ["primary", "secondary", "ghost", "danger"];
const STATES: BtnState[] = ["default", "hover", "focus", "disabled", "loading"];
const THEMES = ["light", "dark"] as const;
const DENSITIES = ["comfortable", "compact"] as const;

export const DIMS = [
  { name: "size", n: 3, values: "sm · md · lg" },
  { name: "intent", n: 4, values: "primary · secondary · ghost · danger" },
  { name: "state", n: 5, values: "default · hover · focus · disabled · loading" },
  { name: "theme", n: 2, values: "light · dark" },
  { name: "density", n: 2, values: "comfortable · compact" },
  { name: "platform", n: 3, values: "web · iOS · Android" },
];

export const RULES: [string, string[]][] = [
  ["size", ["sm → height − 8, inset × .75", "md → size.control.height", "lg → height + 8, inset × 1.25"]],
  ["intent", ["primary → color.action.*", "secondary → border.strong", "ghost → action.text, no fill", "danger → feedback.error"]],
  ["state", ["hover → *.hover", "focus → focus.ring", "disabled → surface.sunken", "loading → aria-busy, width held", "default"]],
  ["theme", ["light map", "dark map"]],
  ["density", ["comfortable × 1", "compact × .84"]],
  ["platform", ["web 36", "iOS 44 · radius 10", "Android 40 · full radius"]],
];

export function Variants() {
  return (
    <Scene
      id="variants"
      label="One button multiplied by 3 sizes, 4 intents, 5 states, 2 themes and 2 densities becomes 240 combinations; across 3 platforms, 720. Nobody designs 720 buttons. They design 19 rules that produce them."
    >
      {({ step }) => <Views desktop={<VariantsStage step={step} />} mobile={<VariantsM step={step} />} />}
    </Scene>
  );
}

function VariantsStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const dims = Math.min(step, 6); // how many dimensions are applied
  const total = DIMS.slice(0, dims).reduce((a, d) => a * d.n, 1);
  const rules = step >= 7;

  const sizes = dims >= 1 ? SIZES : (["md"] as const);
  const intents = dims >= 2 ? INTENTS : (["primary"] as Intent[]);
  const states = dims >= 3 ? STATES : (["default"] as BtnState[]);
  const themes = dims >= 4 ? THEMES : (["light"] as const);
  const densities = dims >= 5 ? DENSITIES : (["comfortable"] as const);

  return (
    <div className="vx">
      <div className="vx-formula">
        <p className="vx-eq t-mono" aria-live="polite">
          <span>1 button</span>
          {DIMS.map((d, i) => (
            <span key={d.name} className="vx-factor fade" data-on={i < dims}>
              <span className="t-muted"> × </span>
              {d.n} {d.name}
              {d.n > 1 ? (d.name.endsWith("y") ? "" : "s") : ""}
            </span>
          ))}
        </p>
        <p className="vx-total t-num" data-rules={rules}>
          {rules ? (
            <>
              19 <span className="vx-total__unit">rules</span>
            </>
          ) : (
            <>
              {total} <span className="vx-total__unit">{total === 1 ? "button" : "combinations"}</span>
            </>
          )}
        </p>
        <p className="t-essay">
          {step === 0 && "One button. One picture of it."}
          {step > 0 && step < 6 && (
            <>
              Adding <em>{DIMS[dims - 1].name}</em>: {DIMS[dims - 1].values}.
            </>
          )}
          {step === 6 && (
            <>
              Three platforms. <em>720 buttons</em> — before anyone asks for an icon-only variant.
            </>
          )}
          {rules && (
            <>
              Nobody draws 720 buttons. They write <em>19 rules</em> — 3 + 4 + 5 + 2 + 2 + 3 — and the system multiplies them.
              Rules create range.
            </>
          )}
        </p>
      </div>

      <div className="vx-stage">
        <div className="vx-matrix" data-platforms={step >= 6} data-dim={rules}>
          {themes.map((t) => (
            <SystemScope key={t} config={{ mode: t }} className="vx-band scope-surface">
              {densities.map((d) =>
                sizes.map((sz) => (
                  <div key={`${d}-${sz}`} className="vx-row" data-density={d}>
                    {intents.map((it) =>
                      states.map((st) => (
                        <span key={`${it}-${st}`} className="vx-cell">
                          <Button inert size={sz} intent={it} state={st}>
                            {desktop ? "Save" : undefined}
                          </Button>
                        </span>
                      )),
                    )}
                  </div>
                )),
              )}
            </SystemScope>
          ))}
        </div>

        <ol className="vx-rules fade" data-on={rules}>
          {RULES.map(([dim, list]) => (
            <li key={dim}>
              <span className="t-label">
                {dim} <span className="t-accent">{list.length}</span>
              </span>
              <span className="t-mono">{list.join("   ")}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
