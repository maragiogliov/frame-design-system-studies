"use client";

import { COUNTS, OPS, ScaleFigure } from "../Scale";

export function ScaleM({ step }: { step: number }) {
  const n = COUNTS[step];
  const organized = step === 4;
  const pairs = (n * (n - 1)) / 2;
  const fresh = OPS.filter((o) => o.at === Math.min(step, 3));

  return (
    <div className="m msc">
      <div className="m-top">
        <dl className="msc-counts">
          <div>
            <dt className="m-label">products</dt>
            <dd className="m-big">{n}</dd>
          </div>
          <div data-dim={organized}>
            <dt className="m-label">pairwise talks</dt>
            <dd className="m-big">{pairs.toLocaleString("en")}</dd>
          </div>
          <div data-hl={organized}>
            <dt className="m-label">via system</dt>
            <dd className="m-big">{n}</dd>
          </div>
        </dl>
      </div>

      <div className="m-focus">
        <ScaleFigure n={n} organized={organized} />
      </div>

      <div className="m-foot">
        {organized ? (
          <p className="m-title is-sm">
            Scale does not remove complexity. <span className="t-accent">It organizes it.</span>
          </p>
        ) : (
          <>
            <span className="m-label">{step === 0 ? "what works" : "now necessary"}</span>
            <p className="m-read">{fresh.map((o) => o.item).join(" · ")}</p>
          </>
        )}
      </div>
    </div>
  );
}
