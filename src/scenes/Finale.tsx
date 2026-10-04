"use client";

import { useMemo } from "react";
import { Scene } from "@/hooks/scene";
import { useSystem } from "@/system/SystemProvider";
import { COLUMNS, EDGES, NODES } from "@/system/graph";

const HISTORY = [
  ["v1.0", "radius.control = 2px · space.base = 4px"],
  ["v1.4", "focus.ring = 2px, offset 2px"],
  ["v2.0", "color.action.primary → vermilion"],
  ["v3.0", "size.control.height.ios = 44"],
  ["v3.2", "Button / Legacy deprecated"],
  ["v4.0", "semantic layer shared across 3 brands"],
  ["v4.4", "Field gains an action slot"],
  ["v5.0", "Button / Legacy removed"],
];

/** graph positions in %, from the same graph the Network scene uses */
const POS = (() => {
  const m = new Map<string, [number, number]>();
  COLUMNS.forEach((c, ci) => {
    const ns = NODES.filter((n) => n.kind === c.kind);
    ns.forEach((n, i) => m.set(n.id, [8 + ci * 16.8, 8 + ((i + 0.5) * 84) / ns.length]));
  });
  return m;
})();

export function Finale() {
  return (
    <Scene
      id="finale"
      label="The network simplifies into a single line: a record. Systems do not remove change; they make change manageable. A design system is a record of decisions. A study by Victor Maragioglio."
    >
      {({ step }) => <FinaleStage step={step} />}
    </Scene>
  );
}

function FinaleStage({ step }: { step: number }) {
  const { decisions } = useSystem();
  const collapsed = step >= 1;
  const yours = decisions.slice(-6);

  const order = useMemo(() => NODES.map((n) => n.id), []);

  return (
    <div className="fin">
      <div className="fin-field" aria-hidden="true">
        <svg className="fin-edges" viewBox="0 0 100 100" preserveAspectRatio="none" data-on={!collapsed}>
          {EDGES.map(([a, b]) => {
            const [x1, y1] = POS.get(a)!;
            const [x2, y2] = POS.get(b)!;
            return <line key={`${a}${b}`} x1={x1} y1={y1} x2={x2} y2={y2} vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
        <span className="fin-line" data-on={collapsed} />
        {order.map((id, i) => {
          const [x, y] = POS.get(id)!;
          const ty = 6 + (i * 88) / (order.length - 1);
          return (
            <span
              key={id}
              className="fin-dot"
              style={{
                left: `${collapsed ? 4 : x}%`,
                top: `${collapsed ? ty : y}%`,
                transitionDelay: `calc(${(i % 12) * 0.03}s * var(--motion-scale))`,
              }}
            />
          );
        })}
      </div>

      <div className="fin-text">
        <p className="t-essay fin-zero fade" data-on={step === 0}>
          Every decision in this study, at once. Now let it resolve.
        </p>
        <p className="t-statement fin-a fade" data-on={step === 1}>
          Systems do not remove change.
          <br />
          <span className="t-accent">They make change manageable.</span>
        </p>

        <div className="fin-record fade" data-on={step === 2}>
          <p className="t-display fin-b">
            A design system
            <br />
            is a record
            <br />
            <span className="t-accent">of decisions.</span>
          </p>
          <ol className="fin-history t-mono">
            {HISTORY.map(([v, d]) => (
              <li key={v}>
                <span className="t-muted">{v}</span> {d}
              </li>
            ))}
            {yours.map((d) => (
              <li key={d.id} className="is-yours">
                <span>you</span> {d.token} {d.from} → {d.to}
              </li>
            ))}
            {yours.length === 0 && (
              <li className="t-muted">your decisions in the laboratory will be recorded here</li>
            )}
          </ol>
        </div>

        <div className="fin-author fade" data-on={step === 3}>
          <p className="t-label">Design systems</p>
          <p className="fin-author__by">
            A study by
            <br />
            <a href="https://victormaragioglio.com">Victor Maragioglio</a>
          </p>
          <p className="t-label">
            <a href="https://victormaragioglio.com">victormaragioglio.com</a>
          </p>
          <button type="button" className="ctl fin-replay" onClick={() => window.dispatchEvent(new Event("study:replay"))}>
            ↺ Replay study
          </button>
        </div>
      </div>
    </div>
  );
}
