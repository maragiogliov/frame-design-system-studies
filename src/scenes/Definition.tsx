"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Scene, useDesktop, useStepOverride } from "@/hooks/scene";
import { useWires, WireLayer, type WireSpec } from "@/hooks/wires";
import { cx } from "@/ui/kit";

const COLS: { id: string; label: string; terms: string[] }[] = [
  { id: "decide", label: "Decide", terms: ["rules", "ownership", "governance", "platform decisions"] },
  { id: "encode", label: "Encode", terms: ["tokens", "accessibility", "content conventions", "responsive logic"] },
  { id: "build", label: "Build", terms: ["primitives", "components", "states", "behaviors", "patterns"] },
  { id: "sustain", label: "Sustain", terms: ["documentation", "testing", "versioning", "contribution", "migration"] },
];

const LIBRARY = ["primitives", "components", "states", "behaviors"];

const DEF: Record<string, string> = {
  rules: "Constraints stated once: how things space, align, respond, speak.",
  ownership: "Someone answers for each decision. Unowned parts rot first.",
  governance: "How decisions are proposed, challenged, accepted, retired.",
  "platform decisions": "What is shared across web, iOS, Android — and what must not be.",
  tokens: "Named decisions. Values can change without consumers knowing.",
  accessibility: "Constraints that reach every layer: contrast, focus, motion, targets, language.",
  "content conventions": "Voice, labels, error grammar. Words are interface.",
  "responsive logic": "Rules for how layouts and controls change with space and input.",
  primitives: "Surface, text, icon, border, space. The smallest reusable parts.",
  components: "Primitives composed with behavior and state. One part of the system.",
  states: "Default, hover, focus, pressed, disabled, loading, error… the real surface area.",
  behaviors: "Keyboard, focus management, announcements, timing.",
  patterns: "Recurring compositions with intent: forms, filters, confirmation.",
  documentation: "Why, when, and when not. The system’s memory.",
  testing: "Visual, interaction and accessibility checks that keep promises true.",
  versioning: "Change with a name and a contract. Consumers choose when.",
  contribution: "How product teams push needs back into the system.",
  migration: "Moving consumers from old decisions to new ones. Never instant.",
};

const EDGES: [string, string][] = [
  ["rules", "tokens"],
  ["rules", "content conventions"],
  ["rules", "behaviors"],
  ["platform decisions", "responsive logic"],
  ["platform decisions", "primitives"],
  ["ownership", "migration"],
  ["governance", "versioning"],
  ["governance", "contribution"],
  ["tokens", "primitives"],
  ["accessibility", "tokens"],
  ["accessibility", "states"],
  ["accessibility", "behaviors"],
  ["accessibility", "testing"],
  ["content conventions", "patterns"],
  ["responsive logic", "patterns"],
  ["primitives", "components"],
  ["states", "components"],
  ["behaviors", "components"],
  ["components", "patterns"],
  ["components", "documentation"],
  ["components", "testing"],
  ["patterns", "documentation"],
  ["versioning", "migration"],
  ["contribution", "patterns"],
];

const slug = (t: string) => t.replace(/\s+/g, "-");
const colOf = (t: string) => COLS.findIndex((c) => c.terms.includes(t));

export function Definition() {
  return (
    <Scene
      id="definition"
      label="The definition 'a design system is a collection of components' is struck out and replaced by a map of eighteen connected concerns across deciding, encoding, building and sustaining. Components are one node. The component library covers primitives, components, states and behaviours; the design system is everything."
    >
      {({ step }) => <DefinitionStage step={step} />}
    </Scene>
  );
}

function DefinitionStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const map = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useStepOverride<string>(step, () => "components");

  const specs = useMemo<WireSpec[]>(
    () =>
      EDGES.map(([a, b]) => {
        const hot = a === sel || b === sel;
        return {
          key: `${a}>${b}`,
          from: `[data-t="${slug(a)}"]`,
          to: `[data-t="${slug(b)}"]`,
          on: step >= 2,
          tone: hot ? "action" : "faint",
          route: colOf(a) === colOf(b) ? "loop" : "curve",
        };
      }),
    [sel, step],
  );
  const { paths } = useWires(map, desktop ? specs : [], desktop);

  // the component-library boundary is measured from the real nodes
  const [box, setBox] = useState<{ l: number; t: number; w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const c = map.current;
    if (!c) return;
    const m = () => {
      const cr = c.getBoundingClientRect();
      const rs = LIBRARY.map((t) => c.querySelector(`[data-t="${slug(t)}"]`)?.getBoundingClientRect()).filter(Boolean) as DOMRect[];
      if (!rs.length) return;
      const l = Math.min(...rs.map((r) => r.left)) - cr.left - 28;
      const t = Math.min(...rs.map((r) => r.top)) - cr.top - 8;
      const r = Math.max(...rs.map((r) => r.right)) - cr.left + 10;
      const b = Math.max(...rs.map((r) => r.bottom)) - cr.top + 8;
      setBox({ l, t, w: r - l, h: b - t });
    };
    m();
    const ro = new ResizeObserver(m);
    ro.observe(c);
    return () => ro.disconnect();
  }, [desktop]);

  const related = new Set(EDGES.filter(([a, b]) => a === sel || b === sel).flat());
  const deps = EDGES.filter(([, b]) => b === sel).map(([a]) => a);
  const feeds = EDGES.filter(([a]) => a === sel).map(([, b]) => b);

  return (
    <div className="def">
      <p className="def-sentence t-statement" data-small={step >= 2}>
        A design system is{" "}
        <span className="def-strike" data-struck={step >= 1}>
          a collection of components
        </span>
        <span className="def-replace fade" data-on={step >= 2}>
          {" "}
          a network of decisions.
        </span>
      </p>

      <div ref={map} className="def-map fade" data-on={step >= 2}>
        <WireLayer paths={paths} />
        {box && desktop && (
          <>
            <div className="def-boundary is-system fade" data-on={step >= 3} aria-hidden="true">
              <span className="t-label">design system</span>
            </div>
            <div
              className="def-boundary is-library fade"
              data-on={step >= 3}
              style={{ left: box.l, top: box.t, width: box.w, height: box.h }}
              aria-hidden="true"
            >
              <span className="t-label">component library</span>
            </div>
          </>
        )}
        {COLS.map((col) => (
          <div key={col.id} className="def-col">
            <span className="t-label def-col__label">{col.label}</span>
            <ul className="def-col__list">
              {col.terms.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    className={cx("def-term", t === "components" && "is-components")}
                    data-t={slug(t)}
                    aria-pressed={t === sel}
                    data-related={related.has(t) && t !== sel}
                    onClick={() => setSel(t)}
                    tabIndex={step >= 2 ? 0 : -1}
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="def-note fade" data-on={step >= 2} aria-live="polite">
        <p className="t-label t-accent">{sel}</p>
        <p className="t-essay">{DEF[sel]}</p>
        {!desktop && (
          <p className="t-mono t-muted" style={{ marginTop: 8 }}>
            {deps.length > 0 && <>needs: {deps.join(", ")}</>}
            {deps.length > 0 && feeds.length > 0 && <br />}
            {feeds.length > 0 && <>feeds: {feeds.join(", ")}</>}
          </p>
        )}
      </div>

      <p className="def-conclusion t-heading fade" data-on={step >= 3}>
        A component library is part of a design system.
        <br />
        <span className="t-accent">It is not the system.</span>
      </p>
    </div>
  );
}
