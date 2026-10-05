"use client";

import { useStepOverride } from "@/hooks/scene";
import { COLS, DEF, EDGES, LIBRARY } from "../Definition";

export function DefinitionM({ step }: { step: number }) {
  const [sel, setSel] = useStepOverride<string>(step, () => "components");
  const needs = EDGES.filter(([, b]) => b === sel).map(([a]) => a);
  const feeds = EDGES.filter(([a]) => a === sel).map(([, b]) => b);
  const map = step >= 2;

  return (
    <div className="m md">
      <div className="m-top">
        <p className={map ? "m-title is-sm" : "m-title"}>
          A design system is{" "}
          <span className="def-strike" data-struck={step >= 1}>
            a collection of components
          </span>
          {map && <span className="t-accent"> a network of decisions.</span>}
        </p>
      </div>

      <div className="m-focus is-top">
        {map && (
          <div className="md-groups">
            {COLS.map((c) => (
              <div key={c.id} className="md-group">
                <span className="m-label">{c.label}</span>
                <span className="md-terms">
                  {c.terms.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="md-term"
                      aria-pressed={t === sel}
                      data-lib={step >= 3 && LIBRARY.includes(t)}
                      onClick={() => setSel(t)}
                    >
                      {t}
                    </button>
                  ))}
                </span>
              </div>
            ))}
          </div>
        )}
        {!map && step === 1 && <p className="m-cap">Components are real. They are also the smallest part of the answer.</p>}
      </div>

      <div className="m-foot">
        {step < 2 && <p className="m-read t-muted">a common definition — scroll to test it</p>}
        {step === 2 && (
          <>
            <p className="m-cap">
              <em>{sel}</em> — {DEF[sel]}
            </p>
            <p className="m-read">
              {needs.length > 0 && (
                <>
                  <span className="t-muted">needs </span>
                  {needs.join(", ")}
                  <br />
                </>
              )}
              {feeds.length > 0 && (
                <>
                  <span className="t-muted">feeds </span>
                  {feeds.join(", ")}
                </>
              )}
            </p>
          </>
        )}
        {step === 3 && (
          <p className="m-title is-sm">
            The dashed terms are the component library. <span className="t-accent">The system is all of it.</span>
          </p>
        )}
      </div>
    </div>
  );
}
