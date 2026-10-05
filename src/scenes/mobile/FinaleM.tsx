"use client";

import { useSystem } from "@/system/SystemProvider";
import { EDGES } from "@/system/graph";
import { HISTORY, POS } from "../Finale";

export function FinaleM({ step }: { step: number }) {
  const { decisions } = useSystem();
  const yours = decisions.slice(-3);

  return (
    <div className="m mfin">
      <div className="m-top">
        {step === 0 && <p className="m-cap">Every decision in this study, at once. Now let it resolve.</p>}
        {step === 1 && (
          <p className="m-title">
            Systems do not remove change. <span className="t-accent">They make change manageable.</span>
          </p>
        )}
        {step === 2 && (
          <p className="m-title">
            A design system is a record <span className="t-accent">of decisions.</span>
          </p>
        )}
      </div>

      <div className="m-focus is-top">
        {step === 0 && (
          <svg className="mfin-net" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {EDGES.map(([a, b]) => {
              const [x1, y1] = POS.get(a)!;
              const [x2, y2] = POS.get(b)!;
              return <line key={a + b} x1={x1} y1={y1} x2={x2} y2={y2} vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
        )}
        {step === 1 && <span className="mfin-line" />}
        {step === 2 && (
          <ol className="fin-history mfin-history">
            {HISTORY.slice(0, 6).map(([v, d]) => (
              <li key={v}>
                <span className="t-muted">{v}</span> {d}
              </li>
            ))}
            {yours.map((d) => (
              <li key={d.id} className="is-yours">
                <span>you</span> {d.token} {d.from} → {d.to}
              </li>
            ))}
          </ol>
        )}
        {step === 3 && (
          <div className="mfin-author">
            <span className="m-label">Design systems</span>
            <p className="fin-author__by">
              A study by
              <br />
              <a href="https://victormaragioglio.com">Victor Maragioglio</a>
            </p>
            <a className="m-label intro-author__link" href="https://victormaragioglio.com">
              victormaragioglio.com
            </a>
          </div>
        )}
      </div>

      <div className="m-foot">
        {step === 3 ? (
          <button type="button" className="ctl fin-replay" onClick={() => window.dispatchEvent(new Event("study:replay"))}>
            ↺ Replay study
          </button>
        ) : (
          <p className="m-read t-muted">{["46 nodes", "one line", "a record", ""][step]}</p>
        )}
      </div>
    </div>
  );
}
