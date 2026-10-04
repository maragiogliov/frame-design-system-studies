"use client";

import { useMemo } from "react";
import { Scene } from "@/hooks/scene";

const COUNTS = [1, 3, 10, 50, 50];
const W = 640;
const H = 520;
const HUB: [number, number] = [W / 2, H / 2];

const POS: [number, number][] = Array.from({ length: 50 }, (_, i) => {
  const a = i * 2.39996; // golden angle
  const r = 120 + 125 * Math.sqrt((i + 0.5) / 50);
  // rounded: server and client Math.cos may differ in the last digits (hydration)
  return [Math.round((HUB[0] + Math.cos(a) * r) * 10) / 10, Math.round((HUB[1] + Math.sin(a) * r * 0.86) * 10) / 10];
});

const OPS: { at: number; item: string }[] = [
  { at: 0, item: "decisions made in conversation" },
  { at: 0, item: "one repo, one designer, one engineer" },
  { at: 1, item: "a shared library" },
  { at: 1, item: "a changelog" },
  { at: 1, item: "naming conventions" },
  { at: 2, item: "documentation people can find" },
  { at: 2, item: "semantic versioning" },
  { at: 2, item: "an owning team" },
  { at: 2, item: "a contribution process" },
  { at: 2, item: "release notes, office hours" },
  { at: 3, item: "a governance forum" },
  { at: 3, item: "a deprecation policy" },
  { at: 3, item: "codemods and lint rules" },
  { at: 3, item: "visual regression in CI" },
  { at: 3, item: "adoption metrics" },
  { at: 3, item: "a support rota" },
];

const NOTE = [
  "At one product, informal decisions work. The system is a habit.",
  "Three products: the first copies appear. Someone writes a changelog.",
  "Ten products: memory no longer scales. Documentation, versions and owners do.",
  "Fifty products: 1,225 possible pairwise conversations. Nobody can have them.",
  "",
];

export function Scale() {
  return (
    <Scene
      id="scale"
      label="At 1, 3, 10 and 50 products, the number of possible pairwise coordination conversations grows from 0 to 3, 45 and 1,225. A system routes coordination through shared rules — 50 connections instead of 1,225 — but requires documentation, versioning, ownership, governance, migration and automation. Scale does not remove complexity; it organizes it."
    >
      {({ step }) => <ScaleStage step={step} />}
    </Scene>
  );
}

function ScaleStage({ step }: { step: number }) {
  const n = COUNTS[step];
  const organized = step === 4;
  const pairs = (n * (n - 1)) / 2;

  const web = useMemo(() => {
    let d = "";
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) d += `M${POS[i][0].toFixed(1)} ${POS[i][1].toFixed(1)}L${POS[j][0].toFixed(1)} ${POS[j][1].toFixed(1)}`;
    return d;
  }, [n]);
  const spokes = useMemo(
    () => POS.slice(0, n).map(([x, y]) => `M${HUB[0]} ${HUB[1]}L${x.toFixed(1)} ${y.toFixed(1)}`).join(""),
    [n],
  );

  return (
    <div className="sc">
      <div className="sc-figure">
        <svg viewBox={`0 0 ${W} ${H}`} className="sc-svg" aria-hidden="true">
          <path d={web} className="sc-web" data-on={!organized} />
          <path d={spokes} className="sc-spokes" data-organized={organized} />
          <ellipse cx={HUB[0]} cy={HUB[1]} rx={92} ry={80} className="sc-ring" data-on={organized} />
          {POS.map(([x, y], i) => (
            <rect key={i} x={x - 4} y={y - 4} width={8} height={8} className="sc-node" data-on={i < n} />
          ))}
          <rect x={HUB[0] - 34} y={HUB[1] - 13} width={68} height={26} className="sc-hub" />
          <text x={HUB[0]} y={HUB[1] + 4} className="sc-hub__text">
            SYSTEM
          </text>
          {organized && (
            <text x={HUB[0]} y={HUB[1] - 90} className="sc-ring__text">
              governance · versioning · ownership
            </text>
          )}
        </svg>
      </div>

      <div className="sc-side">
        <dl className="sc-counts">
          <div>
            <dt className="t-label">products</dt>
            <dd className="t-num">{n}</dd>
          </div>
          <div data-dim={organized}>
            <dt className="t-label">possible pairwise conversations</dt>
            <dd className="t-num">{pairs.toLocaleString("en")}</dd>
          </div>
          <div data-hl={organized}>
            <dt className="t-label">connections through the system</dt>
            <dd className="t-num">{n}</dd>
          </div>
        </dl>

        <div className="sc-ops">
          <span className="t-label">what becomes necessary</span>
          <ul>
            {OPS.map((o) => (
              <li key={o.item} data-on={o.at <= Math.min(step, 3)} data-new={o.at === step} data-gone={o.at === 0 && step >= 2}>
                {o.item}
              </li>
            ))}
          </ul>
        </div>

        {organized ? (
          <p className="t-statement sc-statement">
            Scale does not remove complexity.
            <br />
            <span className="t-accent">It organizes it.</span>
          </p>
        ) : (
          <p className="t-essay">{NOTE[step]}</p>
        )}
      </div>
    </div>
  );
}
