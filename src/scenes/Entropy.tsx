"use client";

import { useMemo, useRef, type CSSProperties } from "react";
import { Scene, useDesktop , Views } from "@/hooks/scene";
import { EntropyM } from "./mobile/EntropyM";
import { useWires, WireLayer, type WireSpec } from "@/hooks/wires";

/* ------------------------------------------------------------------ data */

type Focus = "ring" | "none" | "glow" | "darken";
interface Props {
  bg: string;
  radius: number;
  padX: number;
  h: number;
  shadow: string;
  focus: Focus;
  icon: number;
}
interface Change {
  at: number;
  set: Partial<Props>;
  note: string;
}
interface Instance {
  id: string;
  team: number;
  label: string;
  born: number;
  init?: Partial<Props>;
  changes: Change[];
  /** what governance does with it */
  governed: "variant-lg" | "variant-secondary" | "exception" | "default";
}

export const SOURCE: Props = { bg: "#C8370F", radius: 2, padX: 16, h: 36, shadow: "none", focus: "ring", icon: 16 };

const SH = {
  sm: "0 1px 2px rgba(0,0,0,.25)",
  md: "0 2px 6px rgba(0,0,0,.22)",
  lg: "0 6px 14px -4px rgba(0,0,0,.35)",
  inset: "inset 0 -2px 0 rgba(0,0,0,.25)",
  hard: "2px 2px 0 #1D1C1A",
};

export const TEAMS = ["Checkout", "Search", "Onboarding", "Admin", "Mobile", "Marketing"];
export const TICKS = ["shared", "forked", "month 3", "month 6", "month 9", "month 12", "month 18", "audit", "governance", "v2.0"];

export const INSTANCES: Instance[] = [
  { id: "c1", team: 0, label: "Continue", born: 1, governed: "default", changes: [
    { at: 2, set: { bg: "#D2421A" }, note: "red “closer to the brand deck”" },
    { at: 3, set: { padX: 20 }, note: "padding +4" },
    { at: 5, set: { shadow: SH.sm }, note: "shadow for “lift”" },
  ] },
  { id: "c2", team: 0, label: "Pay now", born: 3, init: { h: 44, radius: 4 }, governed: "variant-lg", changes: [
    { at: 3, set: {}, note: "forked a large Pay button" },
    { at: 4, set: { bg: "#E04A1F" }, note: "brighter for urgency" },
    { at: 5, set: { focus: "none" }, note: "focus ring removed — “clashed with promo”" },
  ] },
  { id: "c3", team: 0, label: "Apply code", born: 5, init: { bg: "#C9381A", radius: 4, h: 32 }, governed: "variant-secondary", changes: [
    { at: 5, set: {}, note: "small inline button, copied from a mock" },
  ] },
  { id: "s1", team: 1, label: "Search", born: 1, governed: "default", changes: [
    { at: 2, set: { radius: 4 }, note: "radius +2" },
    { at: 3, set: { icon: 18 }, note: "icon 16 → 18" },
    { at: 4, set: { bg: "#C43A14" }, note: "colour sampled from a screenshot" },
  ] },
  { id: "s2", team: 1, label: "Filter", born: 4, init: { bg: "#B8340F", radius: 6, shadow: SH.inset }, governed: "variant-secondary", changes: [
    { at: 4, set: {}, note: "new Filter button, own styles" },
  ] },
  { id: "o1", team: 2, label: "Next", born: 1, governed: "default", changes: [
    { at: 2, set: { radius: 8 }, note: "radius 8 — “friendlier”" },
    { at: 3, set: { shadow: SH.md }, note: "drop shadow added" },
    { at: 4, set: { bg: "#D94F2B" }, note: "warmer red" },
  ] },
  { id: "o2", team: 2, label: "Skip", born: 3, init: { radius: 8, bg: "#E85A2E", focus: "glow" }, governed: "variant-secondary", changes: [
    { at: 3, set: {}, note: "Skip button; glow instead of ring" },
  ] },
  { id: "o3", team: 2, label: "Finish setup", born: 6, init: { radius: 12, bg: "#D94F2B", shadow: SH.lg }, governed: "default", changes: [
    { at: 6, set: {}, note: "radius 12 for the final step" },
  ] },
  { id: "a1", team: 3, label: "Save", born: 1, governed: "default", changes: [
    { at: 2, set: { radius: 0 }, note: "radius 0 — “sharper for tables”" },
    { at: 3, set: { h: 28 }, note: "height 28 for dense rows" },
    { at: 4, set: { focus: "darken" }, note: "ring → darken (overlapped cells)" },
  ] },
  { id: "a2", team: 3, label: "Delete", born: 4, init: { bg: "#A92F0E", radius: 0, h: 28 }, governed: "default", changes: [
    { at: 4, set: {}, note: "destructive = darker red, no danger intent" },
  ] },
  { id: "a3", team: 3, label: "Export", born: 5, init: { bg: "#CC3D12", radius: 0, h: 28, shadow: SH.hard }, governed: "variant-secondary", changes: [
    { at: 5, set: {}, note: "Export with a hard shadow" },
  ] },
  { id: "m1", team: 4, label: "Continue", born: 1, governed: "variant-lg", changes: [
    { at: 2, set: { h: 48, radius: 6 }, note: "48 tall “for thumbs”" },
    { at: 3, set: { focus: "none" }, note: "focus removed — “no keyboards on phones”" },
    { at: 4, set: { bg: "#C33510" }, note: "red re-picked on device" },
  ] },
  { id: "m2", team: 4, label: "Sign in", born: 4, init: { h: 48, radius: 999, bg: "#C33510" }, governed: "variant-lg", changes: [
    { at: 4, set: {}, note: "pill shape “to match Android”" },
  ] },
  { id: "m3", team: 4, label: "Allow", born: 6, init: { h: 48, radius: 999, bg: "#D63E16", shadow: SH.md }, governed: "variant-lg", changes: [
    { at: 6, set: {}, note: "permission prompt button" },
  ] },
  { id: "k1", team: 5, label: "Start free trial", born: 1, governed: "exception", changes: [
    { at: 2, set: { padX: 28 }, note: "padding +12 for the hero" },
    { at: 3, set: { shadow: SH.lg }, note: "big shadow to “pop”" },
    { at: 4, set: { focus: "glow" }, note: "glow focus" },
    { at: 5, set: { bg: "#E85A2E" }, note: "campaign orange" },
  ] },
  { id: "k2", team: 5, label: "Book a demo", born: 3, init: { radius: 6, bg: "#D2421A", shadow: SH.hard }, governed: "variant-secondary", changes: [
    { at: 3, set: {}, note: "copied from a landing page kit" },
  ] },
  { id: "k3", team: 5, label: "Download", born: 5, init: { radius: 5 }, governed: "default", changes: [
    { at: 5, set: {}, note: "radius 5 — nobody remembers why" },
  ] },
];

export function propsAt(inst: Instance, step: number): Props {
  const p = { ...SOURCE, ...inst.init };
  for (const c of inst.changes) if (c.at <= step) Object.assign(p, c.set);
  return p;
}

const FINAL = INSTANCES.map((i) => propsAt(i, 6));
const uniq = <T,>(xs: T[]) => Array.from(new Set(xs));
export const AUDIT = {
  buttons: INSTANCES.length,
  colors: uniq(FINAL.map((p) => p.bg)),
  radii: uniq(FINAL.map((p) => p.radius)).sort((a, b) => a - b),
  shadows: uniq(FINAL.map((p) => p.shadow)),
  focus: uniq(FINAL.map((p) => p.focus)),
};

/** deterministic drift offsets */
const jitter = (id: string, k: number) => {
  let h = 0;
  for (const c of id + k) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((h % 1000) / 1000) * 2 - 1;
};

/* ---------------------------------------------------------------- scene */

export function Entropy() {
  return (
    <Scene
      id="entropy"
      label={`One shared button is forked by six product teams. Over eighteen months each team makes small local changes. An audit finds ${AUDIT.buttons} buttons, ${AUDIT.colors.length} action colours, ${AUDIT.radii.length} radii, ${AUDIT.shadows.length} shadows and ${AUDIT.focus.length} focus behaviours. Without governance, systems drift. Shared tokens then consolidate them into one component with sanctioned variants and one documented exception.`}
    >
      {({ step }) => <Views desktop={<EntropyStage step={step} />} mobile={<EntropyM step={step} />} />}
    </Scene>
  );
}

function EntropyStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const field = useRef<HTMLDivElement>(null);
  const governed = step >= 8;
  const drift = governed ? 0 : Math.max(0, Math.min(step, 7) - 1) / 5; // 0 … 1.2
  const tick = Math.min(step, 6);

  const visible = INSTANCES.filter((i) => (step === 0 ? false : i.born <= Math.max(1, tick)));

  const specs = useMemo<WireSpec[]>(() => {
    if (step === 0) return [];
    const broken = step >= 4 && !governed;
    return TEAMS.map((team) => ({
      key: `e-${team}`,
      from: '[data-src="button"]',
      to: `[data-lane="${team}"] .ent-lane__team`,
      route: "v" as const,
      bend: 0.5,
      dashed: !governed && step >= 2,
      tone: governed ? ("action" as const) : ("strong" as const),
      on: !broken,
    }));
  }, [step, governed]);
  const { paths } = useWires(field, desktop ? specs : [], `${step}${desktop}`);

  const notes = (team: number) =>
    INSTANCES.filter((i) => i.team === team)
      .flatMap((i) => i.changes.filter((c) => c.at <= tick && step >= 2).map((c) => ({ ...c, id: i.id })))
      .sort((a, b) => a.at - b.at);

  return (
    <div className="ent">
      <div ref={field} className="ent-field">
        <WireLayer paths={paths} />
        <div className="ent-source" data-src="button">
          <span className="t-label">{governed ? "Button · v2.0 · tokens" : step === 0 ? "Button · shared" : "Button · v1 (copied)"}</span>
          <span
            className="ent-btn"
            style={governed ? tokenStyle("default") : styleOf(SOURCE)}
            data-gov={governed}
          >
            Continue
          </span>
        </div>

        <div className="ent-lanes" data-on={step >= 1}>
          {TEAMS.map((team, t) => {
            const lane = visible.filter((i) => i.team === t);
            const dx = desktop ? jitter(team, 1) * drift * 10 : 0;
            return (
              <div key={team} className="ent-lane" data-lane={team} style={{ transform: `translate(${dx}px, ${Math.abs(jitter(team, 4)) * drift * (desktop ? 34 : 0)}px)` }}>
                <span className="t-label ent-lane__team">{team}</span>
                <div className="ent-lane__items">
                  {lane.map((inst) => {
                    const p = propsAt(inst, tick);
                    const ox = jitter(inst.id, 2) * drift * (desktop ? 10 : 4);
                    const oy = jitter(inst.id, 3) * drift * (desktop ? 8 : 0);
                    return (
                      <span
                        key={inst.id}
                        className="ent-inst"
                        data-inst={inst.id}
                        style={{ transform: `translate(${ox}px, ${oy}px)` }}
                      >
                        <span className="ent-btn" style={governed ? tokenStyle(inst.governed) : styleOf(p)} data-gov={governed}>
                          {desktop && <Arrow size={governed ? 16 : p.icon} />}
                          {inst.label}
                        </span>
                        {governed && inst.governed === "exception" && <span className="ent-tag t-mono">documented exception</span>}
                        {governed && inst.governed.startsWith("variant") && (
                          <span className="ent-tag t-mono">{inst.governed === "variant-lg" ? "size=lg" : "intent=secondary"}</span>
                        )}
                      </span>
                    );
                  })}
                </div>
                {desktop && (
                  <ul className="ent-notes t-mono">
                    {!governed &&
                      notes(t)
                        .slice(-3)
                        .map((n) => (
                          <li key={n.id + n.at + n.note} data-new={n.at === tick}>
                            {n.note}
                          </li>
                        ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <ol className="ent-time t-mono" aria-hidden="true">
          {TICKS.map((label, i) => (
            <li key={label} data-now={i === step} data-past={i < step}>
              {label}
            </li>
          ))}
        </ol>
      </div>

      <aside className="ent-audit fade" data-on={step >= 7}>
        <p className="ent-statement t-statement" data-on={step === 7}>
          Without governance,
          <br />
          <span className="t-accent">systems drift.</span>
        </p>
        <dl className="ent-inv">
          <Row n={governed ? 1 : AUDIT.buttons} label={governed ? "component" : "buttons"} />
          <Row n={governed ? 1 : AUDIT.colors.length} label="action colours">
            {AUDIT.colors.map((c, i) => (
              <span key={c} className="ent-chip" data-keep={i === 0} data-gov={governed} style={{ background: i === 0 && governed ? "var(--color-action-primary)" : c }} />
            ))}
          </Row>
          <Row n={governed ? 1 : AUDIT.radii.length} label="radii">
            {AUDIT.radii.map((r, i) => (
              <span key={r} className="ent-corner t-mono" data-keep={i === 1} data-gov={governed}>
                {r === 999 ? "pill" : r}
              </span>
            ))}
          </Row>
          <Row n={governed ? 1 : AUDIT.shadows.length} label="shadows">
            {AUDIT.shadows.map((s, i) => (
              <span key={s} className="ent-shadow" data-keep={s === "none"} data-gov={governed} style={{ boxShadow: s === "none" ? undefined : s }} />
            ))}
          </Row>
          <Row n={governed ? 1 : AUDIT.focus.length} label="focus behaviours">
            {AUDIT.focus.map((f) => (
              <span key={f} className="ent-focus t-mono" data-keep={f === "ring"} data-gov={governed} data-bad={f === "none"}>
                {f}
              </span>
            ))}
          </Row>
        </dl>
        <p className="t-essay ent-caption">
          {step === 7 && <>No one decided this. Every change was reasonable, local, and invisible to the other five teams.</>}
          {step === 8 && (
            <>
              Shared rules arrive as tokens: <em>color.action.primary, radius.control, space.inset.control, focus.ring</em>. The
              drift reverses.
            </>
          )}
          {step === 9 && (
            <>
              Not sameness: <em>1 component, 2 sanctioned variants, 1 documented exception</em>. The exception is visible — that is
              the point.
            </>
          )}
        </p>
      </aside>
    </div>
  );
}

function Row({ n, label, children }: { n: number; label: string; children?: React.ReactNode }) {
  return (
    <div className="ent-inv__row">
      <dt>
        <span className="ent-inv__n t-num">{n}</span> <span className="t-label">{label}</span>
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

export function styleOf(p: Props): CSSProperties {
  return {
    background: p.bg,
    borderRadius: p.radius,
    padding: `0 ${p.padX}px`,
    height: p.h,
    boxShadow: p.shadow === "none" ? undefined : p.shadow,
  };
}

export function tokenStyle(g: Instance["governed"]): CSSProperties {
  const lg = g === "variant-lg";
  const sec = g === "variant-secondary";
  return {
    background: sec ? "transparent" : "var(--button-primary-background)",
    color: sec ? "var(--color-text-primary)" : "var(--button-primary-text)",
    border: sec ? "1px solid var(--button-secondary-border)" : "1px solid transparent",
    borderRadius: "var(--button-radius)",
    padding: `0 ${g === "exception" ? "28px" : "var(--button-paddingInline)"}`,
    height: lg ? "calc(var(--button-height) + 8px)" : "var(--button-height)",
  };
}

function Arrow({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" style={{ transition: "width var(--motion-duration-base), height var(--motion-duration-base)" }}>
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
