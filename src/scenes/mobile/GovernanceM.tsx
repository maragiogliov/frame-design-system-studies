"use client";

import { useEffect, useRef } from "react";
import { consumers, pulse } from "@/system/pulse";
import { Button, Field } from "@/ui/kit";
import { LOCAL, LOG, ObjectView, STAGES } from "../Governance";

export function GovernanceM({ step }: { step: number }) {
  const obj = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (step === 6) pulse(consumers(obj.current, "color.action.primary").concat(consumers(obj.current, "radius.control")), obj.current);
  }, [step]);
  const teams = step === 2 || step === 8;

  return (
    <div className="m mgov">
      <div className="m-top">
        <div className="m-steps" aria-hidden="true">
          {STAGES.map((s, i) => (
            <span key={s.id} data-on={i < step} data-now={i === step} />
          ))}
        </div>
        <span className="m-label">
          {String(step + 1).padStart(2, "0")} · decided by {STAGES[step].who}
        </span>
        <p className="m-title is-sm">{STAGES[step].label}</p>
      </div>

      <div className="m-focus" ref={obj}>
        {teams ? (
          <div className="mgov-teams">
            {LOCAL.map((l) => (
              <div key={l.team} className="gov-team">
                <span className="m-label">{l.team}</span>
                {step === 8 ? (
                  <Field inert label={l.label} placeholder="" action={<Button inert size="sm" intent="secondary">{l.action}</Button>} />
                ) : (
                  <span className="local-field" style={l.style} aria-hidden="true">
                    <span className="local-field__input">{l.label}</span>
                    <span className="local-field__btn">{l.action}</span>
                  </span>
                )}
              </div>
            ))}
            {step === 2 && <p className="m-read t-muted">Marketing’s countdown button: used once — stays local.</p>}
          </div>
        ) : (
          <ObjectView step={step} />
        )}
      </div>

      <div className="m-foot">
        <p className="m-cap">{LOG[step][LOG[step].length - 1]}</p>
        {LOG[step].length > 1 && <p className="m-read t-muted">{LOG[step][0]}</p>}
      </div>
    </div>
  );
}
