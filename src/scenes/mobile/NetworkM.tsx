"use client";

import { useMemo } from "react";
import { useStepOverride } from "@/hooks/scene";
import { BREAKING_CHANGES, byId, COLUMNS, downstreamWaves, EDGES, impact, NODES } from "@/system/graph";
import { BY_STEP, type Sel } from "../Network";

export function NetworkM({ step }: { step: number }) {
  const [sel, setSel] = useStepOverride<Sel>(step, (s) => BY_STEP[s]);
  const change = sel.change ? BREAKING_CHANGES.find((c) => c.id === sel.change)! : null;
  const result = change ? impact(change) : null;
  const waves = useMemo(() => (sel.node ? downstreamWaves(sel.node) : result ? result.waves.filter((w) => w.length) : []), [sel.node, result]);

  return (
    <div className="m mnet">
      <div className="m-top">
        {!sel.node && !change && (
          <>
            <p className="m-title is-sm">The invisible architecture.</p>
            <p className="m-cap">
              {NODES.length} decisions, {EDGES.length} dependencies. <em>This study is one of the products.</em>
            </p>
          </>
        )}
        <label className="net-select">
          <span className="m-label">node</span>
          <select value={sel.node ?? ""} onChange={(e) => setSel({ node: e.target.value, change: null })}>
            <option value="" disabled>
              choose a node…
            </option>
            {COLUMNS.map((c) => (
              <optgroup key={c.kind} label={c.label}>
                {NODES.filter((x) => x.kind === c.kind).map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      <div className="m-focus is-top">
        {sel.node && <p className="m-cap">{byId.get(sel.node)!.note}</p>}
        {change && result && (
          <p className="m-read">
            {change.diff}
            <br />
            <span className="t-muted">→</span> {result.count.component} components · {result.count.pattern} patterns · {result.count.product} products
            <br />
            <span className="t-muted">→</span> <span className="t-accent">{result.cost} units of migration · {change.release === "major" ? "MAJOR v5.0.0" : "minor v4.5.0"}</span>
          </p>
        )}
        {waves.length > 0 && (
          <ol className="net-waves mnet-waves">
            {waves.slice(0, 3).map((w, i) => (
              <li key={i}>
                <span className="m-label">wave {i + 1}</span> {w.slice(0, 7).join(", ")}
                {w.length > 7 ? ` +${w.length - 7}` : ""}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="m-foot">
        <span className="m-label">apply a change</span>
        <div className="mnet-changes">
          {BREAKING_CHANGES.map((c) => (
            <button key={c.id} type="button" className="ctl" aria-pressed={sel.change === c.id} onClick={() => setSel({ node: null, change: sel.change === c.id ? null : c.id })}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
