"use client";

import { useEffect, useRef } from "react";
import { Scene , Views } from "@/hooks/scene";
import { GovernanceM } from "./mobile/GovernanceM";
import { consumers, pulse } from "@/system/pulse";
import { Button, Field } from "@/ui/kit";

export const STAGES = [
  { id: "need", label: "local need", who: "Checkout team" },
  { id: "local", label: "local component", who: "Checkout team" },
  { id: "repeat", label: "pattern repeats", who: "3 product teams" },
  { id: "proposal", label: "proposal", who: "Checkout → System team" },
  { id: "review", label: "system review", who: "System team" },
  { id: "a11y", label: "accessibility", who: "Accessibility" },
  { id: "eng", label: "engineering", who: "Engineering" },
  { id: "release", label: "release", who: "System" },
  { id: "adopt", label: "adoption", who: "Products" },
];

export const LOG: string[][] = [
  ["“Customers need to apply a promo code without leaving the order summary.”", "A real need. Not yet a system concern."],
  ["PromoField.tsx, inside Checkout", "hard-coded #E04A1F, radius 6, no label", "Fast. Correct for one team."],
  ["Search builds Filter + Apply", "Admin builds Invite + Add", "Same shape, three implementations — now it is a pattern.", "Marketing’s countdown button: used once. Stays local."],
  ["RFC: InputWithAction", "evidence: 3 teams, 3 implementations", "proposed API: 7 props"],
  ["No new component: Field gains an `action` slot", "API 7 props → 4", "naming follows Field, not PromoField"],
  ["visible label required", "action needs an accessible name: “Apply promo code”", "errors announced via aria-live", "focus ring from color.focus.ring"],
  ["hard-coded values → tokens", "24 visual snapshots · 9 interaction tests", "axe: 0 violations"],
  ["v4.4.0 — Field: `action` slot", "docs: when to use · when not to", "migration note for 3 local copies"],
  ["Checkout, Search, Admin replace their copies", "3 local implementations retired", "one fix now reaches all three"],
];

export const LOCAL: { team: string; label: string; action: string; style: React.CSSProperties }[] = [
  { team: "Checkout", label: "Promo code", action: "Apply", style: { ["--bg" as string]: "#E04A1F", ["--r" as string]: "6px" } },
  { team: "Search", label: "Filter by tag", action: "Apply", style: { ["--bg" as string]: "#B8340F", ["--r" as string]: "0px" } },
  { team: "Admin", label: "Invite by email", action: "Add", style: { ["--bg" as string]: "#2A2926", ["--r" as string]: "3px" } },
];

export function Governance() {
  return (
    <Scene
      id="governance"
      label="Who decides? A promo-code field starts as a local need in one product team, repeats in two others, becomes a proposal, and passes through system review, accessibility validation, engineering and release before products adopt it. A one-off countdown button stays local. Each stage changes the component."
    >
      {({ step }) => <Views desktop={<GovernanceStage step={step} />} mobile={<GovernanceM step={step} />} />}
    </Scene>
  );
}

function GovernanceStage({ step }: { step: number }) {
  const obj = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (step === 6) pulse(consumers(obj.current, "color.action.primary").concat(consumers(obj.current, "radius.control")), obj.current);
  }, [step]);

  return (
    <div className="gov">
      <ol className="gov-track">
        {STAGES.map((s, i) => (
          <li key={s.id} data-state={i === step ? "now" : i < step ? "past" : "next"} aria-current={i === step ? "step" : undefined}>
            <span className="t-mono gov-track__n">{String(i + 1).padStart(2, "0")}</span>
            <span className="gov-track__label">{s.label}</span>
            <span className="t-label">{s.who}</span>
          </li>
        ))}
      </ol>

      <div className="gov-main">
        <div className="gov-object" ref={obj} data-stage={STAGES[step].id}>
          <span className="t-label">
            {step < 3 ? "local" : step < 7 ? "proposed" : step === 7 ? "released · v4.4.0" : "adopted"}
          </span>
          <ObjectView step={step} />
        </div>

        <ul className="gov-log" aria-live="polite">
          {LOG[step].map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>

      <div className="gov-teams" data-on={step === 2 || step === 8}>
        {LOCAL.map((l) => (
          <div key={l.team} className="gov-team">
            <span className="t-label">{l.team}</span>
            {step === 8 ? (
              <Field inert label={l.label} placeholder="" action={<Button inert size="sm" intent="secondary">{l.action}</Button>} />
            ) : (
              <span className="local-field" style={l.style} aria-hidden="true">
                <span className="local-field__input">{l.label}</span>
                <span className="local-field__btn">{l.action}</span>
              </span>
            )}
          </div>
        ))}
        <div className="gov-team is-oneoff" data-on={step === 2}>
          <span className="t-label">Marketing · one-off</span>
          <span className="oneoff-btn" aria-hidden="true">
            Ends in 02:14:09
          </span>
          <span className="t-mono t-muted">used once · stays a local exception</span>
        </div>
      </div>
    </div>
  );
}

export function ObjectView({ step }: { step: number }) {
  if (step === 0) return <p className="gov-need t-essay">“Apply a promo code without leaving the summary.”</p>;
  if (step < 4)
    return (
      <span className="local-field is-big" style={LOCAL[0].style} aria-hidden="true">
        <span className="local-field__input">Promo code</span>
        <span className="local-field__btn">Apply</span>
        {step === 3 && <span className="gov-props t-mono">value · onChange · onApply · buttonText · color · rounded · loading</span>}
      </span>
    );
  if (step === 4)
    return (
      <span className="local-field is-big is-structured" style={LOCAL[0].style} aria-hidden="true">
        <span className="local-field__input">Promo code</span>
        <span className="local-field__btn">Apply</span>
        <span className="gov-props t-mono">label · value · action · status</span>
      </span>
    );
  if (step === 5)
    return (
      <span className="gov-a11y" aria-hidden="true">
        <span className="gov-a11y__label">Promo code</span>
        <span className="local-field is-big is-structured is-accessible" style={LOCAL[0].style}>
          <span className="local-field__input">SPRING-24</span>
          <span className="local-field__btn">Apply</span>
        </span>
        <span className="gov-a11y__err">Code expired on 30 April. Try another.</span>
      </span>
    );
  return (
    <span className="gov-final">
      <Field
        inert
        label="Promo code"
        value="SPRING-24"
        error={step >= 6 ? "Code expired on 30 April. Try another." : undefined}
        action={
          <Button inert size="sm" intent="secondary" label="Apply promo code">
            Apply
          </Button>
        }
      />
      {step >= 7 && (
        <span className="gov-release t-mono">
          <b>v4.4.0</b> + Field: action slot
        </span>
      )}
    </span>
  );
}
