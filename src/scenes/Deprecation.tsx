"use client";

import { useMemo, useRef } from "react";
import { Scene, useDesktop , Views } from "@/hooks/scene";
import { DeprecationM } from "./mobile/DeprecationM";
import { useWires, WireLayer, type WireSpec } from "@/hooks/wires";
import { Button } from "@/ui/kit";

export type Target = "legacy" | "adapter" | "new";

export const CONSUMERS = [
  "Checkout",
  "Billing settings",
  "Admin / Users",
  "Search filters",
  "Onboarding",
  "Help center",
  "Internal tools",
  "Email preferences",
];

// target per consumer, per step
export const PLAN: Target[][] = [
  ["legacy", "legacy", "legacy", "legacy", "legacy", "legacy", "legacy", "legacy"],
  ["legacy", "legacy", "legacy", "legacy", "legacy", "legacy", "legacy", "legacy"],
  ["new", "legacy", "legacy", "new", "new", "legacy", "legacy", "legacy"],
  ["new", "adapter", "legacy", "new", "new", "adapter", "legacy", "legacy"],
  ["new", "adapter", "new", "new", "new", "adapter", "legacy", "legacy"],
  ["new", "adapter", "new", "new", "new", "adapter", "adapter", "adapter"],
  ["new", "new", "new", "new", "new", "new", "new", "new"],
];

export const RELEASE = ["v3.1", "v3.2", "v3.4", "v3.6", "v4.0", "v4.3", "v5.0"];

export const NOTE: Record<number, string> = {
  0: "Button / Legacy: 8 consumers. It works. That is the problem.",
  1: "Deprecated in v3.2. Nothing breaks yet: a warning, a date, an adapter, a replacement.",
  2: "Three teams migrate by hand in their next sprint.",
  3: "A codemod moves two more through the adapter — same props, new component.",
  4: "Two stragglers. Internal tools overrides legacy classes in a custom theme. Email preferences has no owning team.",
  5: "The theme is rewritten; Growth adopts Email preferences. Legacy has 0 direct consumers.",
  6: "v5.0: adapter and legacy removed. Eighteen months, seven releases.",
};

export const STRAGGLER: Record<string, string> = {
  "Internal tools": "blocked: custom theme",
  "Email preferences": "blocked: no owner",
};

export function Deprecation() {
  return (
    <Scene
      id="deprecation"
      label="Button / Legacy is deprecated with eight consumers. An adapter and a replacement are introduced. Consumers migrate in batches across releases v3.2 to v4.3; two are blocked by a custom theme and by having no owning team. In v5.0 the legacy component and the adapter are removed. Systems cannot change instantly."
    >
      {({ step }) => <Views desktop={<DeprecationStage step={step} />} mobile={<DeprecationM step={step} />} />}
    </Scene>
  );
}

function DeprecationStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const field = useRef<HTMLDivElement>(null);
  const plan = PLAN[step];
  const migrated = plan.filter((t) => t !== "legacy").length;
  const removed = step === 6;

  const specs = useMemo<WireSpec[]>(() => {
    const out: WireSpec[] = CONSUMERS.map((c, i) => ({
      key: `${c}-${plan[i]}`,
      from: `[data-consumer="${i}"]`,
      to: `[data-node="${plan[i]}"]`,
      route: "h",
      bend: plan[i] === "new" ? 0.82 : 0.5,
      tone: plan[i] === "legacy" ? "strong" : "action",
      dashed: plan[i] === "legacy" && step >= 1,
    }));
    if (step >= 1 && step < 6) out.push({ key: "adapter-new", from: '[data-node="adapter"]', to: '[data-node="new"]', route: "h", tone: "action" });
    return out;
  }, [plan, step]);
  const { paths } = useWires(field, desktop ? specs : [], `${step}${desktop}`);

  return (
    <div className="dep">
      <div className="dep-top">
        <span className="dep-release t-mono" aria-live="polite">
          {RELEASE[step]}
        </span>
        <div className="dep-progress" aria-label={`Adoption ${migrated} of 8`}>
          <span className="t-label">adoption</span>
          <span className="dep-segs">
            {plan.map((t, i) => (
              <span key={i} data-t={t} />
            ))}
          </span>
          <span className="t-mono t-num">{migrated}/8</span>
        </div>
      </div>

      <div ref={field} className="dep-field">
        <WireLayer paths={paths} />
        <ul className="dep-consumers">
          {CONSUMERS.map((c, i) => (
            <li key={c} data-consumer={i} data-t={plan[i]}>
              <span className="dep-consumer__name">{c}</span>
              <span className="dep-consumer__ui">
                {plan[i] === "legacy" ? (
                  <span className="legacy-btn" aria-hidden="true">
                    SUBMIT
                  </span>
                ) : (
                  <Button inert size="sm">
                    Submit
                  </Button>
                )}
              </span>
              {plan[i] === "legacy" && step >= 4 && STRAGGLER[c] && <span className="dep-block t-mono">{STRAGGLER[c]}</span>}
              {!desktop && <span className="t-mono t-muted dep-to">→ {plan[i]}</span>}
            </li>
          ))}
        </ul>

        <div className="dep-mid">
          <div className="dep-node is-legacy" data-node="legacy" data-removed={removed}>
            <span className="dep-node__name">Button / Legacy</span>
            {step >= 1 && !removed && <span className="dep-stamp t-mono">deprecated · remove in v5.0</span>}
            {removed && <span className="dep-stamp t-mono">removed</span>}
            <span className="t-mono t-muted">
              {plan.filter((t) => t === "legacy").length} direct consumer{plan.filter((t) => t === "legacy").length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="dep-node is-adapter fade" data-node="adapter" data-on={step >= 1 && !removed}>
            <span className="dep-node__name">adapter</span>
            <code className="t-mono">
              kind=&quot;primary&quot; small
              <br />→ intent=&quot;primary&quot; size=&quot;sm&quot;
            </code>
            <span className="t-mono t-muted">{plan.filter((t) => t === "adapter").length} carried</span>
          </div>
        </div>

        <div className="dep-node is-new fade" data-node="new" data-on={step >= 1}>
          <span className="dep-node__name">Button</span>
          <Button inert>Submit</Button>
          <span className="t-mono t-muted">{plan.filter((t) => t !== "legacy").length} consumers</span>
        </div>
      </div>

      <p className="dep-note t-essay">{NOTE[step]}</p>
      <p className="dep-statement t-statement fade" data-on={removed}>
        Systems cannot
        <br />
        change instantly.
      </p>
    </div>
  );
}
