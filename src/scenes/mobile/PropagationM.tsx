"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useStepOverride } from "@/hooks/scene";
import { SystemScope } from "@/system/SystemProvider";
import { pulse } from "@/system/pulse";
import { BRANDS, PRIMITIVES } from "@/system/tokens";
import { Button, Checkbox, Field, Nav, Tag, Toast, Toggle } from "@/ui/kit";
import { BY_STEP, SELECTOR, SWATCH, type Decision, type Tok } from "../Propagation";

export function PropagationM({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  const ctl = useRef<HTMLDivElement>(null);
  const [d, setD] = useStepOverride<Decision>(step, (s) => BY_STEP[s]);
  const [n, setN] = useState(0);

  useLayoutEffect(() => setN(root.current?.querySelectorAll(SELECTOR[d.focus]).length ?? 0), [d]);

  const prev = useRef(d);
  useEffect(() => {
    const p = prev.current;
    prev.current = d;
    const changed: Tok | null =
      p.brand !== d.brand ? "color.action.primary" : p.radius !== d.radius ? "radius.control" : p.space !== d.space ? "space.base" : null;
    if (changed && root.current) pulse(Array.from(root.current.querySelectorAll(SELECTOR[changed])), ctl.current);
  }, [d]);

  const set = (patch: Partial<Decision>, focus: Tok) => setD({ ...d, ...patch, focus });
  const scope = useMemo(() => ({ brand: d.brand, radius: d.radius, spaceBase: d.space }), [d.brand, d.radius, d.space]);

  return (
    <div className="m mp">
      <div className="m-top">
        <p className="mp-count" aria-live="polite">
          <span className="m-big">
            <span className="t-muted">1 →</span> {step >= 1 ? n : "?"}
          </span>
          <span className="m-label">{step >= 1 ? `consequences of ${d.focus}` : "how many things change?"}</span>
        </p>
      </div>

      <SystemScope config={scope} className="m-focus is-top scope-surface">
        <div ref={root} className="mp-frags">
          <Nav items={["Projects", "Reviews", "Billing"]} current={1} />
          <span className="mp-row" data-token="space.200">
            <Button inert>Publish</Button>
            <Button inert intent="secondary">
              Preview
            </Button>
          </span>
          <Field inert value="North studio" />
          <span className="mp-row" data-token="space.300">
            <Toggle inert label="Auto-save" checked />
            <Checkbox inert label="Notify" checked />
            <Tag>Beta</Tag>
          </span>
          <Toast>Invoice sent.</Toast>
        </div>
      </SystemScope>

      <div className="m-foot" ref={ctl}>
        <div className="m-ctl" role="group" aria-label="color.action.primary">
          <span className="m-label">action</span>
          {SWATCH.map((s) => (
            <button
              key={s.brand}
              type="button"
              className="prop-swatch"
              aria-pressed={d.brand === s.brand}
              aria-label={`${s.primitive} (${BRANDS[s.brand].name})`}
              onClick={() => set({ brand: s.brand }, "color.action.primary")}
            >
              <span style={{ background: PRIMITIVES[s.primitive] }} />
            </button>
          ))}
        </div>
        <div className="m-ctl">
          <label className="m-label" htmlFor="mp-radius">
            radius
          </label>
          <input
            id="mp-radius"
            className="range"
            style={{ flex: 1 }}
            type="range"
            min={0}
            max={12}
            value={d.radius}
            onChange={(e) => set({ radius: +e.target.value }, "radius.control")}
          />
          <span className="m-read">{d.radius}px</span>
        </div>
        <div className="m-ctl" role="group" aria-label="space.base">
          <span className="m-label">space</span>
          {[4, 6, 8].map((v) => (
            <button key={v} type="button" className="ctl" aria-pressed={d.space === v} onClick={() => set({ space: v }, "space.base")}>
              {v}px
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
