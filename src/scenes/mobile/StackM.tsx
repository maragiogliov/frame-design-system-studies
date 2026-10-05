"use client";

import { EFFECT, FORCES, LAYERS } from "../Stack";

export function StackM({ step }: { step: number }) {
  const force = step >= 1 && step <= 5 ? FORCES[step - 1] : null;
  const summary = step === 6;

  return (
    <div className="m ms">
      <div className="m-top">
        {step === 0 && <p className="m-title is-sm">Seven layers. Each consumes the one above.</p>}
        {force && (
          <>
            <span className="m-label">force {step} of 5</span>
            <p className="m-title is-sm t-accent">{force}</p>
          </>
        )}
        {summary && <p className="m-title is-sm">Forces cut across every layer — unevenly.</p>}
      </div>

      <ol className="m-focus is-top ms-layers">
        {LAYERS.map((l, i) => {
          const effect = force ? EFFECT[force][l.id] : undefined;
          const count = FORCES.filter((f) => EFFECT[f][l.id]).length;
          return (
            <li key={l.id} className="ms-layer" data-hit={!!effect || summary} data-dim={!!force && !effect}>
              <span className="ms-layer__name">
                <span className="t-mono t-muted">{String(i + 1).padStart(2, "0")}</span> {l.name}
              </span>
              {effect && <span className="ms-layer__effect">{effect}</span>}
              {summary && (
                <span className="ms-layer__dots" aria-label={`${count} of 5 forces`}>
                  {FORCES.map((f) => (
                    <span key={f} data-on={!!EFFECT[f][l.id]} />
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="m-foot">
        <p className="m-read">
          {FORCES.map((f, i) => (
            <span key={f} className={force === f ? "t-accent" : i < step - 1 || summary ? undefined : "t-muted"}>
              {i > 0 && " · "}
              {f}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
