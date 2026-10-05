"use client";

import { CONSUMERS, NOTE, PLAN, RELEASE, STRAGGLER } from "../Deprecation";

const LABEL = { legacy: "legacy", adapter: "via adapter", new: "migrated" } as const;

export function DeprecationM({ step }: { step: number }) {
  const plan = PLAN[step];
  const migrated = plan.filter((t) => t !== "legacy").length;
  const removed = step === 6;

  return (
    <div className="m mdep">
      <div className="m-top">
        <p className="mdep-head">
          <span className="m-big">{RELEASE[step]}</span>
          <span className="m-read">
            {migrated}/8 <span className="t-muted">off legacy</span>
          </span>
        </p>
        <div className="dep-segs">
          {plan.map((t, i) => (
            <span key={i} data-t={t} />
          ))}
        </div>
      </div>

      <ul className="m-focus is-top mdep-list">
        {CONSUMERS.map((c, i) => (
          <li key={c} data-t={plan[i]}>
            <span>{c}</span>
            <span className="m-read">
              {plan[i] === "legacy" && step >= 4 && STRAGGLER[c] ? <span className="mdep-block">{STRAGGLER[c]}</span> : LABEL[plan[i]]}
            </span>
          </li>
        ))}
      </ul>

      <div className="m-foot">
        {removed ? (
          <p className="m-title is-sm">
            Systems cannot <span className="t-accent">change instantly.</span>
          </p>
        ) : (
          <p className="m-cap">{NOTE[step]}</p>
        )}
      </div>
    </div>
  );
}
