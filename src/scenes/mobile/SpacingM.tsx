"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStepOverride } from "@/hooks/scene";
import { SystemScope } from "@/system/SystemProvider";
import { Button, Toggle } from "@/ui/kit";
import { BY_STEP, Gap } from "../Spacing";

export function SpacingM({ step }: { step: number }) {
  const [base, setBase] = useStepOverride<number>(step, (s) => BY_STEP[s]);
  const show = step >= 1;
  const spec = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = spec.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(Math.round(el.getBoundingClientRect().height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scope = useMemo(() => ({ spaceBase: base }), [base]);

  return (
    <div className="m mspc">
      <div className="m-top">
        <p className="m-cap">
          {base === 4 && !show && "A settings screen. Nothing on it chose its own spacing."}
          {base === 4 && show && (
            <>
              Every gap is a <em>named step</em> of one rhythm.
            </>
          )}
          {base === 8 && (
            <>
              One value changed. <em>Every gap kept its proportion.</em>
            </>
          )}
          {base === 6 && "Rhythm is a ratio, not a list of numbers."}
          {base === 2 && (
            <>
              At 2px the rhythm collapses — but targets hold at <em>24px</em>.
            </>
          )}
        </p>
      </div>

      <SystemScope config={scope} className="m-focus is-top">
        <div ref={spec} className="mspc-spec">
          <div className="spc-pad" data-show={show}>
            <div className="spc-inner">
              <span className="spc-title">Notifications</span>
              <Gap t="100" show={show} />
              <span className="spc-sub">Choose what reaches you.</span>
              <Gap t="600" show={show} />
              <Toggle inert label="Mentions and replies" checked />
              <Gap t="300" show={show} />
              <Toggle inert label="Weekly digest" />
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

      <div className="m-foot">
        <p className="m-read">
          <span className="t-muted">space.base</span> {base}px <span className="t-muted">→ space.300 =</span> {base * 3}px{" "}
          <span className="t-muted">· height</span> {h}px
        </p>
        <div className="m-ctl" role="group" aria-label="space.base">
          <span className="m-label">base</span>
          {[2, 4, 6, 8].map((n) => (
            <button key={n} type="button" className="ctl" aria-pressed={base === n} onClick={() => setBase(n)}>
              {n}px
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
