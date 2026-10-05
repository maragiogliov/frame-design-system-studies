"use client";

import type { CSSProperties } from "react";
import { CORE, EDGE_CONDITIONS, Specimen } from "../States";

const BIG: CSSProperties = {
  ["--button-height" as string]: "52px",
  ["--type-label-md" as string]: "18px",
  ["--button-paddingInline" as string]: "24px",
  ["--size-icon-md" as string]: "18px",
};

export function StatesM({ step }: { step: number }) {
  const core = step < 9 ? CORE[step] : null;
  const cond = step >= 9 && step < 15 ? EDGE_CONDITIONS[step - 9] : null;
  const live = step === 15;
  const delta = cond?.delta ?? core?.delta ?? [];

  return (
    <div className="m mstate">
      <div className="m-top">
        {!live && (
          <>
            <span className="m-label">
              {core ? `state ${step + 1} of 9` : `condition ${step - 8} of 6 — multiplies every state`}
            </span>
            <p className="m-title">{core ? core.id : cond!.id}</p>
            <p className="m-read t-muted">{core ? (core.from ? `${core.from} —${core.event}→ ${core.id}` : "at rest") : cond!.rule}</p>
          </>
        )}
        {live && (
          <p className="m-title">
            A component is not a picture. <span className="t-accent">It is a state machine.</span>
          </p>
        )}
      </div>

      <div className="m-focus mstate-focus" style={BIG}>
        <Specimen step={step} />
      </div>

      <div className="m-foot">
        {live ? (
          <p className="m-read t-muted">tap it — loading, success, and on every third try, error. All real.</p>
        ) : (
          <p className="m-read">
            {delta.map(([k, v]) => (
              <span key={k} className="mstate-delta">
                <span className="t-muted">{k}</span> {v}
              </span>
            ))}
          </p>
        )}
        <div className="mstate-chips" aria-hidden="true">
          {CORE.map((s, i) => (
            <span key={s.id} data-now={i === step} data-seen={i < step || step >= 9}>
              {s.id}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
