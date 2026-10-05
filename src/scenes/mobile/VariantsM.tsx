"use client";

import { useState } from "react";
import { useScrollFade } from "@/hooks/scrollFade";
import type { Intent } from "@/ui/kit";
import { DENSITIES, DIMS, INTENTS, RULES, SIZES, STATES, THEMES, VariantMatrix } from "../Variants";

/**
 * Phones: one intent group at a time, at real tap size. Light and dark sit
 * side by side in a horizontal scroller, so the grid uses the height of the
 * screen instead of shrinking into chips.
 */
export function VariantsM({ step }: { step: number }) {
  const scroller = useScrollFade<HTMLDivElement>();
  const [intent, setIntent] = useState<Intent>("primary");
  const dims = Math.min(step, 6);
  const total = DIMS.slice(0, dims).reduce((a, d) => a * d.n, 1);
  const rules = step >= 7;

  const sizes = dims >= 1 ? SIZES : (["md"] as const);
  const intents: Intent[] = dims >= 2 ? [intent] : ["primary"];
  const states = dims >= 3 ? STATES : (["default"] as const);
  const themes = dims >= 4 ? THEMES : (["light"] as const);
  const densities = dims >= 5 ? DENSITIES : (["comfortable"] as const);
  const shown = sizes.length * intents.length * states.length * themes.length * densities.length;

  return (
    <div className="m mv">
      <div className="m-top">
        <p className="m-read">
          1 button
          {DIMS.slice(0, dims).map((d) => (
            <span key={d.name}>
              <span className="t-muted"> × </span>
              {d.n} {d.name}
            </span>
          ))}
        </p>
        <p className="mv-total">
          <span className="m-big" data-rules={rules}>
            {rules ? 19 : total}
          </span>
          <span className="m-label">{rules ? "rules" : total === 1 ? "button" : "combinations"}</span>
        </p>
      </div>

      <div className="m-focus is-top">
        {!rules ? (
          <>
            {dims >= 2 && (
              <div className="m-ctl mv-tabs" role="group" aria-label="Intent shown">
                {INTENTS.map((it) => (
                  <button key={it} type="button" className="ctl" aria-pressed={intent === it} onClick={() => setIntent(it)}>
                    {it}
                  </button>
                ))}
                <span className="mv-shown m-read t-muted">
                  {shown}/{total}
                </span>
              </div>
            )}
            <div ref={scroller} className="vx-scroll mv-scroll" tabIndex={0} aria-label="Button combinations, scrolls sideways">
              <VariantMatrix
                className="vx-matrix mv-matrix"
                data-platforms={step >= 6}
                themes={themes}
                densities={densities}
                sizes={sizes}
                intents={intents}
                states={states}
                labels={dims >= 3}
              />
            </div>
            <p className="vx-hint m-read" aria-hidden="true">
              {dims >= 4 ? "dark →" : "scroll →"}
            </p>
          </>
        ) : (
          <ol className="mv-rules">
            {RULES.map(([dim, list]) => (
              <li key={dim}>
                <span className="m-big">{list.length}</span>
                <span className="m-label">{dim}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="m-foot">
        <p className="m-cap">
          {step === 0 && "One button. One picture of it."}
          {step > 0 && step < 6 && (
            <>
              + <em>{DIMS[dims - 1].name}</em>: {DIMS[dims - 1].values}
            </>
          )}
          {step === 6 && (
            <>
              × 3 platforms = <em>720</em>. Nobody draws these.
            </>
          )}
          {rules && (
            <>
              3 + 4 + 5 + 2 + 2 + 3 rules. <em>Rules create range.</em>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
