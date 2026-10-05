"use client";

import { SystemScope } from "@/system/SystemProvider";
import { DIMS, RULES } from "../Variants";

const SIZES = ["sm", "md", "lg"];
const INTENTS = ["primary", "secondary", "ghost", "danger"];
const STATES = ["default", "hover", "focus", "disabled", "loading"];

/** Phones: each combination is a mark, not a miniature button. */
export function VariantsM({ step }: { step: number }) {
  const dims = Math.min(step, 6);
  const total = DIMS.slice(0, dims).reduce((a, d) => a * d.n, 1);
  const rules = step >= 7;
  const sizes = dims >= 1 ? SIZES : ["md"];
  const intents = dims >= 2 ? INTENTS : ["primary"];
  const states = dims >= 3 ? STATES : ["default"];
  const themes = dims >= 4 ? (["light", "dark"] as const) : (["light"] as const);
  const densities = dims >= 5 ? ["comfortable", "compact"] : ["comfortable"];

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
          <div className="mv-matrix" data-platforms={step >= 6}>
            {themes.map((t) => (
              <SystemScope key={t} config={{ mode: t }} className="mv-band scope-surface">
                {densities.map((d) =>
                  sizes.map((sz) => (
                    <div key={`${d}${sz}`} className="mv-row" data-size={sz} data-density={d}>
                      {intents.map((it) =>
                        states.map((st) => <span key={`${it}${st}`} className="mv-cell" data-intent={it} data-state={st} />),
                      )}
                    </div>
                  )),
                )}
              </SystemScope>
            ))}
          </div>
        ) : (
          <ol className="mv-rules">
            {RULES.map(([dim, list]) => (
              <li key={dim}>
                <span className="m-big">{list.length}</span>
                <span>
                  <span className="m-label">{dim}</span>
                  <br />
                  <span className="m-read t-muted">{list.slice(0, 2).join(" · ")}</span>
                </span>
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
