"use client";

import { useStepOverride } from "@/hooks/scene";
import { useSystem } from "@/system/SystemProvider";
import { colorRefs, contrast, PRIMITIVES, type Mode } from "@/system/tokens";
import { COMPONENT, TWO_LAYER } from "../Tokens";

const CHAINS = ["page.background", "page.text", "button.primary.background"];

export function TokensM({ step }: { step: number }) {
  const { config } = useSystem();
  const [mode, setMode] = useStepOverride<Mode>(step, (s) => (s >= 3 ? "dark" : "light"));
  const [layers, setLayers] = useStepOverride<3 | 2>(step, (s) => (s >= 4 ? 2 : 3));
  const refs = colorRefs({ ...config, brand: "a", mode });
  const light = colorRefs({ ...config, brand: "a", mode: "light" });

  const prim = (c: string) => {
    const sem = COMPONENT.find(([k]) => k === c)![1];
    return layers === 3 ? refs[sem] : TWO_LAYER[mode][c];
  };
  const hex = (c: string) => PRIMITIVES[prim(c)];
  const textC = contrast(hex("page.text"), hex("page.background"));
  const forgot = (c: string) => layers === 2 && mode === "dark" && TWO_LAYER.dark[c] === TWO_LAYER.light[c];

  return (
    <div className="m mt">
      <div className="m-top">
        <p className="m-cap">
          {step === 0 && (
            <>
              <em>Primitives</em> say what a colour is.
            </>
          )}
          {step === 1 && (
            <>
              <em>Semantic tokens</em> say what it is for.
            </>
          )}
          {step === 2 && (
            <>
              <em>Component tokens</em> point at meaning, never at values.
            </>
          )}
          {step === 3 && layers === 3 && (
            <>
              Dark mode: only the last link moves. <em>No component changed.</em>
            </>
          )}
          {layers === 2 && (
            <>
              Without the middle layer, dark mode is patched by hand — <em>and someone forgets.</em>
            </>
          )}
        </p>
      </div>

      <div className="m-focus is-top mt-chains">
        {CHAINS.map((c) => {
          const sem = COMPONENT.find(([k]) => k === c)![1];
          const p = prim(c);
          const moved = mode === "dark" && (layers === 3 ? light[sem] !== p : TWO_LAYER.light[c] !== p);
          return (
            <div key={c} className="mt-chain">
              {step >= 2 && <span className="mt-link is-comp">{c}</span>}
              {step >= 1 && (
                <span className="mt-link is-sem" data-struck={layers === 2}>
                  {step >= 2 && "↳ "}
                  {sem}
                </span>
              )}
              <span className="mt-link is-prim" data-moved={moved} data-bad={forgot(c)}>
                {step >= 1 && "↳ "}
                <span className="mt-sw" style={{ background: PRIMITIVES[p] }} /> {p}
                {forgot(c) && <span className="mt-flag"> not updated</span>}
              </span>
            </div>
          );
        })}
      </div>

      <div className="m-foot">
        {step >= 2 && (
          <div className="mt-render" style={{ background: hex("page.background"), color: hex("page.text") }}>
            <span>Sign in</span>
            <span className="mt-render__btn" style={{ background: hex("button.primary.background"), color: PRIMITIVES[layers === 3 ? refs["color.text.onAction"] : TWO_LAYER[mode]["button.primary.text"]] }}>
              Continue
            </span>
            <span className="mt-render__c" data-bad={textC < 4.5}>
              {textC.toFixed(1)}:1
            </span>
          </div>
        )}
        <div className="m-ctl" role="group" aria-label="mode">
          <span className="m-label">mode</span>
          {(["light", "dark"] as Mode[]).map((m) => (
            <button key={m} type="button" className="ctl" aria-pressed={mode === m} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
          <span className="m-label" style={{ minWidth: 0, marginLeft: 8 }}>
            layers
          </span>
          {([3, 2] as const).map((l) => (
            <button key={l} type="button" className="ctl" aria-pressed={layers === l} onClick={() => setLayers(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
