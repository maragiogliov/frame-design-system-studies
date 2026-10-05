"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Scene, useStepOverride, Views } from "@/hooks/scene";
import { SpacingM } from "./mobile/SpacingM";
import { SystemScope } from "@/system/SystemProvider";
import { SPACE_STEPS } from "@/system/tokens";
import { Button, Field, Toggle } from "@/ui/kit";

export const BY_STEP = [4, 4, 8, 2];

export function Spacing() {
  return (
    <Scene
      id="spacing"
      label="A settings layout built only from spacing tokens. Changing the base rhythm from 4 to 8 pixels expands every gap and inset; at 2 pixels the layout collapses, but minimum target size still holds at 24 pixels."
    >
      {({ step }) => <Views desktop={<SpacingStage step={step} />} mobile={<SpacingM step={step} />} />}
    </Scene>
  );
}

/** a gap that is a real element sized by a token */
export function Gap({ t, show, axis = "v" }: { t: string; show: boolean; axis?: "v" | "h" }) {
  return (
    <span className="gap" data-axis={axis} data-show={show} style={axis === "v" ? { height: `var(--space-${t})` } : { width: `var(--space-${t})` }} aria-hidden="true">
      {axis === "v" && <span className="gap__label t-mono">space.{t}</span>}
    </span>
  );
}

function SpacingStage({ step }: { step: number }) {
  const [base, setBase] = useStepOverride<number>(step, (s) => BY_STEP[s]);
  const [annot, setAnnot] = useStepOverride<boolean>(step, (s) => s >= 1);
  const spec = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  const first = useRef<number | null>(null);

  useEffect(() => {
    const el = spec.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const v = Math.round(el.getBoundingClientRect().height);
      setH(v);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (base === 4 && h && first.current == null) first.current = h;
  }, [base, h]);

  const scope = useMemo(() => ({ spaceBase: base }), [base]);
  const show = annot;

  return (
    <div className="spc">
      <div className="spc-spec-wrap">
        <SystemScope config={scope} className="spc-scope">
          <div ref={spec} className="spc-spec" data-show={show}>
            <div className="spc-pad" data-show={show}>
              <div className="spc-inner">
                <span className="spc-title">Notifications</span>
                <Gap t="100" show={show} />
                <span className="spc-sub">Choose what reaches you, and when.</span>
                <Gap t="600" show={show} />
                <span className="t-label">Channels</span>
                <Gap t="200" show={show} />
                {["Mentions and replies", "Weekly digest", "Billing alerts"].map((l, i) => (
                  <span key={l} className="spc-row-wrap" data-i={i}>
                    {i > 0 && <Gap t="300" show={show} />}
                    <span className="spc-row">
                      <Toggle inert label={l} checked={i !== 1} />
                    </span>
                  </span>
                ))}
                <Gap t="600" show={show} />
                <span className="spc-fields">
                  <Field inert label="Digest time" value="Mondays, 09:00" />
                  <Gap t="400" show={show} axis="h" />
                  <Field inert label="Quiet hours" value="22:00 – 07:00" />
                </span>
                <Gap t="800" show={show} />
                <span className="spc-actions">
                  <Button inert>Save</Button>
                  <Gap t="200" show={show} axis="h" />
                  <Button inert intent="secondary">
                    Cancel
                  </Button>
                </span>
              </div>
            </div>
          </div>
        </SystemScope>
      </div>

      <aside className="spc-side">
        <div className="spc-controls" role="group" aria-label="Base rhythm">
          <span className="t-mono">space.base</span>
          {[2, 4, 6, 8].map((n) => (
            <button key={n} type="button" className="ctl" aria-pressed={base === n} onClick={() => setBase(n)}>
              {n}px
            </button>
          ))}
          <button type="button" className="ctl" aria-pressed={annot} onClick={() => setAnnot(!annot)}>
            measure
          </button>
        </div>

        <table className="spc-scale t-mono">
          <caption className="sr-only">Resolved spacing scale</caption>
          <tbody>
            {SPACE_STEPS.filter(([k]) => ["100", "200", "300", "400", "600", "800"].includes(k)).map(([k, m]) => (
              <tr key={k}>
                <th scope="row">space.{k}</th>
                <td className="t-muted">
                  {m} × {base}
                </td>
                <td>{m * base}px</td>
                <td>
                  <span className="spc-bar" style={{ width: m * base }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="spc-height t-mono">
          layout height <b className="t-num">{h}px</b>
          {first.current && h !== first.current && (
            <span className="t-muted"> · {h > first.current ? "+" : ""}{Math.round(((h - first.current) / first.current) * 100)}% from 4px</span>
          )}
        </p>

        <p className="t-essay">
          {base === 4 && !annot && "A settings screen. Nothing on it chose its own spacing."}
          {base === 4 && annot && (
            <>
              Every gap is a <em>named step</em> on one scale. None of them is a number someone typed.
            </>
          )}
          {base === 8 && (
            <>
              One value changed. <em>Every relationship kept its proportion</em> — the layout grew as a whole.
            </>
          )}
          {base === 6 && <>Rhythm is a ratio, not a set of numbers.</>}
          {base === 2 && (
            <>
              At 2px the rhythm collapses — but controls hold at <em>size.target.min = 24px</em>. Accessibility is not a spacing
              decision.
            </>
          )}
        </p>
      </aside>
    </div>
  );
}
