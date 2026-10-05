"use client";

import { Scene, Views } from "@/hooks/scene";
import { useScrollFade } from "@/hooks/scrollFade";
import { VariantsM } from "./mobile/VariantsM";
import { SystemScope } from "@/system/SystemProvider";
import { Button, type BtnState, type Intent } from "@/ui/kit";
import type { HTMLAttributes } from "react";

export const SIZES = ["sm", "md", "lg"] as const;
export const INTENTS: Intent[] = ["primary", "secondary", "ghost", "danger"];
export const STATES: BtnState[] = ["default", "hover", "focus", "disabled", "loading"];
export const THEMES = ["light", "dark"] as const;
export const DENSITIES = ["comfortable", "compact"] as const;

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
  const scroller = useScrollFade<HTMLDivElement>();
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
        <div ref={scroller} className="vx-scroll" tabIndex={0} aria-label="Button combinations">
          <VariantMatrix
            className="vx-matrix"
            data-platforms={step >= 6}
            data-dim={rules}
            themes={themes}
            densities={densities}
            sizes={sizes}
            intents={intents}
            states={states}
          />
        </div>
        <p className="vx-hint t-mono" aria-hidden="true">
          scroll sideways →
        </p>

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

/**
 * The combinations as real buttons.
 * Each density block is one CSS grid: a max-content column per state, so states
 * align across sizes, and an 8px spacer column between intent groups, so the
 * group gap (8 + 8 + 8 = 24px) comes from layout, not margins.
 */
export function VariantMatrix({
  themes,
  densities,
  sizes,
  intents,
  states,
  labels,
  ...rest
}: {
  themes: readonly ("light" | "dark")[];
  densities: readonly string[];
  sizes: readonly ("sm" | "md" | "lg")[];
  intents: readonly Intent[];
  states: readonly BtnState[];
  /** show state names above the columns */
  labels?: boolean;
} & HTMLAttributes<HTMLDivElement> & { [k: `data-${string}`]: unknown }) {
  const n = states.length;
  const columns = intents.map(() => `repeat(${n}, max-content)`).join(" 8px ");
  const col = (i: number, s: number) => i * (n + 1) + s + 1;
  return (
    <div {...rest}>
      {themes.map((t) => (
        <SystemScope key={t} config={{ mode: t }} className="vx-band scope-surface" data-theme-band={t}>
          {densities.map((d) => {
            const grid = (
              <div className="vx-density" data-density={d} style={{ gridTemplateColumns: columns }}>
                {labels &&
                  intents.map((it, i) =>
                    states.map((st, si) => (
                      <span key={`h-${it}-${st}`} className="vx-head t-label" style={{ gridRow: 1, gridColumn: col(i, si) }}>
                        {st}
                      </span>
                    )),
                  )}
                {sizes.map((sz, r) =>
                  intents.map((it, i) =>
                    states.map((st, si) => (
                      <span key={`${sz}-${it}-${st}`} className="vx-cell" style={{ gridRow: r + 1 + (labels ? 1 : 0), gridColumn: col(i, si) }}>
                        <Button inert size={sz} intent={it} state={st}>
                          Save
                        </Button>
                      </span>
                    )),
                  ),
                )}
              </div>
            );
            return labels ? (
              <div key={d} className="vx-dgroup">
                <span className="vx-dgroup__label t-label">
                  {t} · {d}
                </span>
                {grid}
              </div>
            ) : (
              <div key={d} style={{ display: "contents" }}>
                {grid}
              </div>
            );
          })}
        </SystemScope>
      ))}
    </div>
  );
}
