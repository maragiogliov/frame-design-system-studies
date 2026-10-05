"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Scene, useDesktop, useStepOverride , Views } from "@/hooks/scene";
import { NetworkM } from "./mobile/NetworkM";
import {
  BREAKING_CHANGES,
  byId,
  COLUMNS,
  directDependencies,
  directDependents,
  downstreamWaves,
  EDGES,
  impact,
  NODES,
  upstream,
  type NodeKind,
} from "@/system/graph";

export interface Sel {
  node: string | null;
  change: string | null;
}

export const BY_STEP: Sel[] = [
  { node: null, change: null },
  { node: "color.action.primary", change: null },
  { node: null, change: "rename" },
  { node: null, change: "space" },
  { node: null, change: null },
];

export const KIND_LABEL: Record<NodeKind, string> = {
  primitive: "primitives",
  mode: "modes",
  token: "tokens",
  component: "components",
  pattern: "patterns",
  product: "products",
};

export function Network() {
  return (
    <Scene
      id="network"
      label={`The whole study as one dependency network: ${NODES.length} nodes and ${EDGES.length} edges from primitives through modes, tokens, components and patterns to products — including this page. Selecting a node shows what depends on it. Applying a breaking change shows the affected network and its migration cost.`}
    >
      {({ step }) => <Views desktop={<NetworkStage step={step} />} mobile={<NetworkM step={step} />} />}
    </Scene>
  );
}

function NetworkStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const [sel, setSel] = useStepOverride<Sel>(step, (s) => BY_STEP[s]);

  const state = useMemo(() => {
    const waves = new Map<string, number>();
    let ups = new Set<string>();
    let origin: string[] = [];
    if (sel.change) {
      const ch = BREAKING_CHANGES.find((c) => c.id === sel.change)!;
      origin = ch.origin;
      impact(ch).waves.forEach((w, i) => w.forEach((id) => waves.set(id, i + 1)));
    } else if (sel.node) {
      origin = [sel.node];
      downstreamWaves(sel.node).forEach((w, i) => w.forEach((id) => waves.set(id, i + 1)));
      ups = upstream(sel.node);
    }
    return { waves, ups, origin };
  }, [sel]);

  const change = sel.change ? BREAKING_CHANGES.find((c) => c.id === sel.change)! : null;
  const result = change ? impact(change) : null;

  return (
    <div className="net">
      <div className="net-graph-wrap">
        {desktop ? (
          <Graph state={state} onSelect={(id) => setSel({ node: sel.node === id ? null : id, change: null })} selected={sel.node} />
        ) : (
          <Neighbourhood sel={sel} onSelect={(id) => setSel({ node: id, change: null })} waves={state.waves} ups={state.ups} />
        )}
      </div>

      <aside className="net-side">
        {!sel.node && !sel.change && (
          <div className="net-intro">
            <p className="t-statement net-statement">
              The invisible
              <br />
              architecture.
            </p>
            <p className="t-essay">
              Every scene you have scrolled through is in this graph — {NODES.length} decisions, {EDGES.length} dependencies.{" "}
              <em>“This study” is one of the products.</em> {desktop ? "Select any node." : "Pick a node."}
            </p>
          </div>
        )}

        {sel.node && !sel.change && (
          <div className="net-node">
            <p className="t-label">{byId.get(sel.node)!.kind}</p>
            <p className="net-node__name">{sel.node}</p>
            <p className="t-essay">{byId.get(sel.node)!.note}</p>
            <dl className="net-kv t-mono">
              <div>
                <dt>depends on</dt>
                <dd>{directDependencies(sel.node).join(", ") || "—"}</dd>
              </div>
              <div>
                <dt>used directly by</dt>
                <dd>{directDependents(sel.node).length}</dd>
              </div>
              <div>
                <dt>affects, transitively</dt>
                <dd>{state.waves.size} nodes</dd>
              </div>
              <div>
                <dt>products reached</dt>
                <dd>
                  {Array.from(state.waves.keys())
                    .filter((id) => byId.get(id)!.kind === "product")
                    .join(", ") || "—"}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="net-changes" role="group" aria-label="Breaking changes">
          <span className="t-label">apply a change</span>
          {BREAKING_CHANGES.map((c) => (
            <button
              key={c.id}
              type="button"
              className="ctl net-change"
              aria-pressed={sel.change === c.id}
              onClick={() => setSel({ node: null, change: sel.change === c.id ? null : c.id })}
            >
              <span>{c.label}</span>
              <span className="t-muted">{c.diff}</span>
            </button>
          ))}
        </div>

        {change && result && (
          <div className="net-impact" aria-live="polite">
            <p className="net-impact__flow t-mono">
              change <span className="t-muted">→</span> {result.affected.size} dependencies <span className="t-muted">→</span>{" "}
              <b>{result.cost}</b> units of migration
            </p>
            <table className="t-mono">
              <tbody>
                {(["component", "pattern", "product"] as NodeKind[]).map((k) => (
                  <tr key={k}>
                    <th scope="row">{result.count[k]}</th>
                    <td>{KIND_LABEL[k]}</td>
                    <td className="t-muted">{change.work[k]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="t-mono net-release">
              release: <b>{change.release === "major" ? "MAJOR · v5.0.0" : "MINOR · v4.5.0"}</b>
              {change.id === "rename" && " · ship an alias, deprecate, remove next major"}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------- desktop graph */

function Graph({
  state,
  onSelect,
  selected,
}: {
  state: { waves: Map<string, number>; ups: Set<string>; origin: string[] };
  onSelect: (id: string) => void;
  selected: string | null;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 560 });
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pos = useMemo(() => {
    const m = new Map<string, [number, number]>();
    const padX = 70;
    const padY = 34;
    COLUMNS.forEach((col, ci) => {
      const nodes = NODES.filter((n) => n.kind === col.kind);
      const x = padX + (ci * (size.w - padX * 2)) / (COLUMNS.length - 1);
      nodes.forEach((n, i) => {
        const y = padY + 24 + ((i + 0.5) * (size.h - padY * 2 - 24)) / nodes.length;
        m.set(n.id, [x, y]);
      });
    });
    return m;
  }, [size]);

  // hover previews dependents without committing a selection
  const hoverWaves = useMemo(() => {
    const w = new Map<string, number>();
    if (hover) downstreamWaves(hover).forEach((ids, i) => ids.forEach((id) => w.set(id, i + 1)));
    return w;
  }, [hover]);

  const waves = hover && !state.origin.length ? hoverWaves : state.waves;
  const origin = hover && !state.origin.length ? [hover] : state.origin;
  const active = origin.length > 0;
  const lit = (id: string) => origin.includes(id) || waves.has(id);

  return (
    <div ref={box} className="net-graph">
      <svg className="net-svg" width={size.w} height={size.h} aria-hidden="true">
        {COLUMNS.map((c, ci) => (
          <text key={c.kind} x={pos.get(NODES.find((n) => n.kind === c.kind)!.id)![0]} y={22} className="net-col">
            {c.label}
          </text>
        ))}
        {EDGES.map(([a, b]) => {
          const [x1, y1] = pos.get(a)!;
          const [x2, y2] = pos.get(b)!;
          const down = lit(a) && waves.has(b);
          const up = !hover && state.ups.has(a) && (state.ups.has(b) || origin.includes(b));
          const mx = (x1 + x2) / 2;
          return (
            <path
              key={`${a}>${b}`}
              d={`M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
              className="net-edge"
              data-state={down ? "down" : up ? "up" : active ? "dim" : "idle"}
              style={{ ["--d" as string]: `${(waves.get(b) ?? 0) * 0.14}s` }}
            />
          );
        })}
      </svg>
      {NODES.map((n) => {
        const [x, y] = pos.get(n.id)!;
        const st = origin.includes(n.id) ? "origin" : waves.has(n.id) ? "down" : !hover && state.ups.has(n.id) ? "up" : active ? "dim" : "idle";
        return (
          <button
            key={n.id}
            type="button"
            className="net-node-btn"
            data-kind={n.kind}
            data-state={st}
            aria-pressed={selected === n.id}
            style={{ left: x, top: y, ["--d" as string]: `${(waves.get(n.id) ?? 0) * 0.14}s` }}
            onClick={() => onSelect(n.id)}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(n.id)}
            onBlur={() => setHover(null)}
          >
            {n.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------ mobile recomposed */

function Neighbourhood({
  sel,
  onSelect,
  waves,
  ups,
}: {
  sel: Sel;
  onSelect: (id: string) => void;
  waves: Map<string, number>;
  ups: Set<string>;
}) {
  const grouped: string[][] = [];
  waves.forEach((w, id) => (grouped[w - 1] = [...(grouped[w - 1] ?? []), id]));
  return (
    <div className="net-mobile">
      <label className="net-select">
        <span className="t-label">node</span>
        <select value={sel.node ?? ""} onChange={(e) => onSelect(e.target.value)}>
          <option value="" disabled>
            choose a node…
          </option>
          {COLUMNS.map((c) => (
            <optgroup key={c.kind} label={c.label}>
              {NODES.filter((n) => n.kind === c.kind).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      {(sel.node || sel.change) && (
        <ol className="net-waves t-mono">
          {ups.size > 0 && (
            <li className="is-up">
              <span className="t-label">needs</span> {Array.from(ups).slice(0, 6).join(", ")}
              {ups.size > 6 ? ` +${ups.size - 6}` : ""}
            </li>
          )}
          {grouped.map((ids, i) => (
            <li key={i}>
              <span className="t-label">wave {i + 1}</span> {ids.join(", ")}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
