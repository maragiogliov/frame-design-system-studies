"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Scene, useDesktop , Views } from "@/hooks/scene";
import { StatesM } from "./mobile/StatesM";
import { useWires, WireLayer, type WireSpec } from "@/hooks/wires";
import { SystemScope } from "@/system/SystemProvider";
import { Button, type BtnState } from "@/ui/kit";

interface StateDef {
  id: string;
  from?: string;
  event: string;
  pos: [number, number];
  delta: [string, string][];
}

export const CORE: StateDef[] = [
  { id: "default", event: "rest", pos: [4, 44], delta: [["background", "color.action.primary"], ["text", "color.text.onAction"], ["cursor", "pointer"]] },
  { id: "hover", from: "default", event: "pointerenter", pos: [30, 8], delta: [["background", "color.action.primaryHover"]] },
  { id: "focus", from: "default", event: "Tab", pos: [30, 80], delta: [["outline", "color.focus.ring · focus.ring.width"], ["offset", "focus.ring.offset"]] },
  { id: "active", from: "hover", event: "pointerdown · Space", pos: [54, 44], delta: [["background", "color.action.primaryHover"], ["transform", "translateY(1px)"]] },
  { id: "pressed", from: "active", event: "toggle on", pos: [56, 4], delta: [["background", "color.action.subtle"], ["border", "color.action.primary"], ["aria", 'aria-pressed="true"']] },
  { id: "selected", from: "pressed", event: "chosen in a group", pos: [84, 4], delta: [["background", "color.surface.inverse"], ["indicator", "color.action.primary"]] },
  { id: "disabled", from: "default", event: "form incomplete", pos: [6, 92], delta: [["background", "color.surface.sunken"], ["text", "color.text.disabled"], ["focus", "removed from tab order"]] },
  { id: "loading", from: "active", event: "submit", pos: [80, 44], delta: [["aria", 'aria-busy="true"'], ["width", "held — label kept, no jump"], ["click", "ignored until settled"]] },
  { id: "error", from: "loading", event: "request failed", pos: [80, 86], delta: [["border", "color.feedback.error"], ["text", "color.feedback.error"], ["message", "announced via aria-live"]] },
];

const EDGES: [string, string][] = [
  ["default", "hover"],
  ["default", "focus"],
  ["hover", "active"],
  ["focus", "active"],
  ["active", "pressed"],
  ["pressed", "selected"],
  ["default", "disabled"],
  ["active", "loading"],
  ["loading", "error"],
];

export const EDGE_CONDITIONS: { id: string; rule: string; delta: [string, string][] }[] = [
  { id: "long content", rule: "wrap to two lines, then truncate with a tooltip", delta: [["max-width", "20rem"], ["lines", "≤ 2"]] },
  { id: "RTL", rule: "layout mirrors; directional icons flip", delta: [["padding", "padding-inline (logical)"], ["icon", "scaleX(-1)"]] },
  { id: "high contrast", rule: "semantic tokens resolve from the high-contrast map", delta: [["background", "color.action.primary → vermilion.700"], ["focus.ring.width", "2px → 3px"]] },
  { id: "reduced motion", rule: "motion.duration.* resolve to 0; the spinner stops", delta: [["motion.duration.base", "360ms → 0ms"], ["indicator", "static"]] },
  { id: "touch input", rule: "hit area ≥ 44 even when the visual stays small", delta: [["size.target.min", "44px"], ["hover", "not available — never the only cue"]] },
  { id: "keyboard focus", rule: "ring only for keyboard (:focus-visible), never removed", delta: [["outline", "color.focus.ring"], ["order", "DOM order = Tab order"]] },
];

const BIG: CSSProperties = {
  ["--button-height" as string]: "60px",
  ["--type-label-md" as string]: "20px",
  ["--button-paddingInline" as string]: "30px",
  ["--size-icon-md" as string]: "20px",
};

export function States() {
  return (
    <Scene
      id="states"
      label="One button moves through nine states — default, hover, focus, active, pressed, selected, disabled, loading and error — and six conditions that multiply them: long content, right-to-left, high contrast, reduced motion, touch input and keyboard focus. A component is not a picture; it is a state machine. At the end the button is live."
    >
      {({ step }) => <Views desktop={<StatesStage step={step} />} mobile={<StatesM step={step} />} />}
    </Scene>
  );
}

function StatesStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const diagram = useRef<HTMLDivElement>(null);
  const core = step < 9 ? CORE[step] : null;
  const cond = step >= 9 && step < 15 ? EDGE_CONDITIONS[step - 9] : null;
  const live = step === 15;

  const specs = useMemo<WireSpec[]>(
    () =>
      EDGES.map(([a, b]) => ({
        key: `${a}-${b}`,
        from: `[data-s="${a}"]`,
        to: `[data-s="${b}"]`,
        route: "curve",
        tone: core && core.id === b && core.from === a ? "action" : step >= 9 ? "faint" : undefined,
        dot: true,
      })),
    [core, step],
  );
  const { paths } = useWires(diagram, desktop ? specs : [], desktop);

  return (
    <div className="sm">
      <div className="sm-left">
        <p className="sm-statement t-statement fade" data-on={live}>
          A component is not a picture.
          <br />
          <span className="t-accent">It is a state machine.</span>
        </p>
        <div className="sm-specimen" style={BIG} data-live={live}>
          <Specimen step={step} />
        </div>
        <div className="sm-now">
          <span className="t-label">{cond ? "condition" : live ? "live" : "state"}</span>
          <span className="sm-now__name">{cond ? cond.id : core ? core.id : "try it"}</span>
          {core && core.from && (
            <span className="t-mono t-muted">
              {core.from} —{core.event}→ {core.id}
            </span>
          )}
          {cond && <span className="t-mono t-muted">{cond.rule}</span>}
          {live && <span className="t-mono t-muted">hover · Tab · Space · click — every state is real</span>}
        </div>
      </div>

      <div className="sm-right">
        <div ref={diagram} className="sm-diagram" data-cond={step >= 9}>
          <WireLayer paths={paths} />
          {CORE.map((s, i) => (
            <span
              key={s.id}
              className="sm-node"
              data-s={s.id}
              data-now={core?.id === s.id}
              data-seen={i < step || step >= 9}
              style={desktop ? { left: `${s.pos[0]}%`, top: `${s.pos[1]}%` } : undefined}
            >
              {s.id}
            </span>
          ))}
        </div>

        <div className="sm-conds" data-on={step >= 9}>
          <span className="t-label">× every state, under</span>
          <ul>
            {EDGE_CONDITIONS.map((c, i) => (
              <li key={c.id} data-now={cond?.id === c.id} data-seen={step >= 9 + i}>
                {c.id}
              </li>
            ))}
          </ul>
        </div>

        <table className="sm-delta t-mono">
          <caption className="t-label">what changes</caption>
          <tbody>
            {(cond?.delta ?? core?.delta ?? [["states", "9"], ["conditions", "6"], ["combinations", "54 — before size, intent or theme"]]).map(([k, val]) => (
              <tr key={k}>
                <th scope="row">{k}</th>
                <td>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Specimen({ step }: { step: number }) {
  const [liveState, setLiveState] = useState<BtnState | undefined>();
  const attempts = useRef(0);
  useEffect(() => setLiveState(undefined), [step]);

  if (step < 9) {
    const id = CORE[step].id as BtnState;
    return (
      <Button inert state={id} icon={id === "error" ? undefined : "arrow"} pressed={id === "pressed"}>
        {id === "error" ? "Retry publish" : "Publish"}
      </Button>
    );
  }
  switch (step) {
    case 9:
      return (
        <span className="sm-long">
          <Button inert icon="arrow">
            Publish and notify the eleven reviewers on this project
          </Button>
        </span>
      );
    case 10:
      return (
        <span dir="rtl" lang="ar" className="sm-rtl">
          <Button inert iconEnd="arrow">
            نشر المسودة
          </Button>
        </span>
      );
    case 11:
      return (
        <SystemScope config={{ contrast: "high" }} className="sm-hc">
          <Button inert state="focus" icon="arrow">
            Publish
          </Button>
        </SystemScope>
      );
    case 12:
      return (
        <span className="sm-reduced">
          <Button inert state="loading">
            Publishing…
          </Button>
        </span>
      );
    case 13:
      return (
        <span className="sm-touch">
          <span className="sm-touch__area" aria-hidden="true">
            44 × 44
          </span>
          <span style={{ ["--button-height" as string]: "32px", ["--type-label-md" as string]: "14px", ["--button-paddingInline" as string]: "14px", ["--size-icon-md" as string]: "16px" }}>
            <Button inert icon="arrow">
              Publish
            </Button>
          </span>
        </span>
      );
    case 14:
      return (
        <span className="sm-kbd">
          <kbd>Tab ⇥</kbd>
          <Button inert state="focus" icon="arrow">
            Publish
          </Button>
        </span>
      );
    default:
      return (
        <Button
          icon={liveState === "loading" ? undefined : "arrow"}
          state={liveState}
          onClick={() => {
            if (liveState === "loading") return;
            setLiveState("loading");
            // every third attempt fails, so the error path is reachable
            const fail = ++attempts.current % 3 === 0;
            window.setTimeout(() => setLiveState(fail ? "error" : undefined), 1400);
          }}
        >
          {liveState === "error" ? "Retry publish" : liveState === "loading" ? "Publishing…" : "Publish"}
        </Button>
      );
  }
}

