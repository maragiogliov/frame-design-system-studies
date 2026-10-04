"use client";

import { useMemo, useRef } from "react";
import { Scene, useDesktop, useStepOverride } from "@/hooks/scene";
import { useWires, WireLayer, type WireSpec } from "@/hooks/wires";
import { useSystem } from "@/system/SystemProvider";
import { colorRefs, contrast, PRIMITIVES, type ColorSemantic, type Mode, type PrimitiveName } from "@/system/tokens";

const COMPONENT: [string, ColorSemantic][] = [
  ["page.background", "color.surface.default"],
  ["page.text", "color.text.primary"],
  ["input.background", "color.surface.raised"],
  ["input.border", "color.border.strong"],
  ["button.primary.background", "color.action.primary"],
  ["button.primary.text", "color.text.onAction"],
];
const SEMANTIC = Array.from(new Set(COMPONENT.map(([, s]) => s)));

/** A two-layer system: components point straight at primitives. Dark mode was patched by hand. */
const TWO_LAYER: Record<Mode, Record<string, PrimitiveName>> = {
  light: {
    "page.background": "paper.50",
    "page.text": "ink.900",
    "input.background": "paper.0",
    "input.border": "ink.700",
    "button.primary.background": "vermilion.600",
    "button.primary.text": "paper.0",
  },
  dark: {
    "page.background": "ink.950", // edited
    "page.text": "ink.900", // forgotten
    "input.background": "ink.900", // edited
    "input.border": "ink.700", // forgotten
    "button.primary.background": "vermilion.600", // forgotten
    "button.primary.text": "paper.0", // forgotten
  },
};

const sl = (t: string) => t.replace(/\./g, "_");

export function Tokens() {
  return (
    <Scene
      id="tokens"
      label="Primitive tokens hold raw values. Semantic tokens hold meaning and point at primitives. Component tokens point at semantic tokens. Switching to dark mode re-routes only the semantic-to-primitive links; component links do not change. Without the semantic layer, dark mode must be patched component by component, and text becomes unreadable."
    >
      {({ step }) => <TokensStage step={step} />}
    </Scene>
  );
}

function TokensStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const { config } = useSystem();
  const field = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useStepOverride<Mode>(step, (s) => (s >= 3 ? "dark" : "light"));
  const [layers, setLayers] = useStepOverride<3 | 2>(step, (s) => (s >= 4 ? 2 : 3));

  const base = { ...config, contrast: config.contrast, brand: "a" as const };
  const refsLight = colorRefs({ ...base, mode: "light" });
  const refsDark = colorRefs({ ...base, mode: "dark" });
  const refs = mode === "dark" ? refsDark : refsLight;

  const primitives = useMemo(() => {
    const set = new Set<PrimitiveName>();
    for (const s of SEMANTIC) (set.add(refsLight[s]), set.add(refsDark[s]));
    for (const m of ["light", "dark"] as Mode[]) Object.values(TWO_LAYER[m]).forEach((p) => set.add(p));
    return Array.from(set);
  }, [refsLight, refsDark]);

  // resolved component values
  const resolved: Record<string, PrimitiveName> = {};
  for (const [c, s] of COMPONENT) resolved[c] = layers === 3 ? refs[s] : TWO_LAYER[mode][c];
  const hex = (c: string) => PRIMITIVES[resolved[c]];

  const specs: WireSpec[] = [];
  if (step >= 1 && layers === 3)
    for (const s of SEMANTIC)
      specs.push({ key: `${s}>${refs[s]}`, from: `[data-c="${sl(s)}"]`, to: `[data-c="${sl(refs[s])}"]`, route: "curve", tone: mode === "dark" ? "action" : "strong", fromSide: "top", toSide: "bottom" });
  if (step >= 2)
    for (const [c, s] of COMPONENT)
      specs.push(
        layers === 3
          ? { key: `${c}>${s}`, from: `[data-c="${sl(c)}"]`, to: `[data-c="${sl(s)}"]`, route: "curve", fromSide: "top", toSide: "bottom" }
          : { key: `${c}>>${resolved[c]}`, from: `[data-c="${sl(c)}"]`, to: `[data-c="${sl(resolved[c])}"]`, route: "curve", tone: TWO_LAYER.dark[c] !== TWO_LAYER.light[c] && mode === "dark" ? "action" : "strong", fromSide: "top", toSide: "bottom" },
      );
  const { paths } = useWires(field, specs, `${desktop}${mode}${layers}`);

  const textC = contrast(hex("page.text"), hex("page.background"));
  const btnC = contrast(hex("button.primary.text"), hex("button.primary.background"));
  const edited = COMPONENT.filter(([c]) => TWO_LAYER.dark[c] !== TWO_LAYER.light[c]).length;

  return (
    <div className="tok">
      <div ref={field} className="tok-field">
        <WireLayer paths={paths} />
        <Tier label="Primitive" sub="raw values · never used directly" on>
          {primitives.map((p) => (
            <Chip key={p} id={p} color={PRIMITIVES[p]} value={PRIMITIVES[p]} lit={Object.values(resolved).includes(p) && step >= 2} />
          ))}
        </Tier>
        <Tier label="Semantic" sub="meaning · resolved per mode" on={step >= 1} struck={layers === 2}>
          {SEMANTIC.map((s) => (
            <Chip key={s} id={s} color={PRIMITIVES[refs[s]]} value={`→ ${refs[s]}`} />
          ))}
        </Tier>
        <Tier label="Component" sub="what parts consume" on={step >= 2}>
          {COMPONENT.map(([c, s]) => (
            <Chip key={c} id={c} color={hex(c)} value={layers === 3 ? `→ ${s.replace("color.", "")}` : `→ ${resolved[c]}`} />
          ))}
        </Tier>
      </div>

      <aside className="tok-side">
        <div className="tok-controls" role="group" aria-label="Token demo controls">
          <span className="t-label">mode</span>
          {(["light", "dark"] as Mode[]).map((m) => (
            <button key={m} type="button" className="ctl" aria-pressed={mode === m} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
          <span className="t-label">layers</span>
          {([3, 2] as const).map((l) => (
            <button key={l} type="button" className="ctl" aria-pressed={layers === l} onClick={() => setLayers(l)}>
              {l === 3 ? "primitive → semantic → component" : "primitive → component"}
            </button>
          ))}
        </div>

        <div
          className="tok-render fade"
          data-on={step >= 2}
          style={{ background: hex("page.background"), color: hex("page.text") }}
          aria-label="Resolved result"
        >
          <span className="tok-render__title">Sign in</span>
          <span className="tok-render__input" style={{ background: hex("input.background"), borderColor: hex("input.border"), color: hex("page.text") }}>
            ada@studio.io
          </span>
          <span className="tok-render__btn" style={{ background: hex("button.primary.background"), color: hex("button.primary.text") }}>
            Continue
          </span>
        </div>

        <dl className="tok-readout t-mono fade" data-on={step >= 2}>
          <div>
            <dt>text on page</dt>
            <dd data-bad={textC < 4.5}>
              {textC.toFixed(1)}:1 {textC < 4.5 ? "✕ fails" : "✓"}
            </dd>
          </div>
          <div>
            <dt>button label</dt>
            <dd data-bad={btnC < 4.5}>
              {btnC.toFixed(1)}:1 {btnC < 4.5 ? "✕ fails" : "✓"}
            </dd>
          </div>
          {layers === 3 ? (
            <>
              <div>
                <dt>semantic links re-routed</dt>
                <dd>{mode === "dark" ? SEMANTIC.length : 0}</dd>
              </div>
              <div>
                <dt>component tokens edited</dt>
                <dd>0</dd>
              </div>
            </>
          ) : (
            <div>
              <dt>component tokens edited by hand</dt>
              <dd data-bad={mode === "dark"}>
                {mode === "dark" ? `${edited} of ${COMPONENT.length} — ${COMPONENT.length - edited} forgotten` : "—"}
              </dd>
            </div>
          )}
        </dl>

        <p className="t-essay tok-caption">
          {step < 3 && layers === 3 && "Primitives say what a colour is. Semantics say what it is for."}
          {step >= 3 && layers === 3 && (
            <>
              <em>Meaning stays. Values move.</em> Every component keeps working because none of them knew the value.
            </>
          )}
          {layers === 2 && (
            <>
              Without a semantic layer, a theme is a <em>search-and-replace</em> across every component — and someone always
              misses one.
            </>
          )}
        </p>
      </aside>
    </div>
  );
}

function Tier({ label, sub, on, struck, children }: { label: string; sub: string; on: boolean; struck?: boolean; children: React.ReactNode }) {
  return (
    <div className="tok-tier fade" data-on={on} data-struck={struck}>
      <div className="tok-tier__label">
        <span className="t-heading">{label}</span>
        <span className="t-label">{struck ? "removed" : sub}</span>
      </div>
      <div className="tok-tier__chips">{children}</div>
    </div>
  );
}

function Chip({ id, color, value, lit }: { id: string; color: string; value: string; lit?: boolean }) {
  return (
    <span className="tchip" data-c={sl(id)} data-lit={lit}>
      <span className="tchip__sw" style={{ background: color }} />
      <span className="tchip__name">{id}</span>
      <span className="tchip__val">{value}</span>
    </span>
  );
}
