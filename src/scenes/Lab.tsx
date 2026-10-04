"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Scene } from "@/hooks/scene";
import { SystemScope, useSystem } from "@/system/SystemProvider";
import { directDependents } from "@/system/graph";
import { consumers, pulse } from "@/system/pulse";
import { BASE_CONFIG, BRANDS, merge, resolveValue, type SystemConfig } from "@/system/tokens";
import { Button, Checkbox, Field, Menu, Nav, Table, Tag, Toast, Toggle } from "@/ui/kit";

type LabKey = "mode" | "density" | "radius" | "spaceBase" | "typeScale" | "brand" | "platform";
type Lab = Pick<SystemConfig, LabKey>;

const INITIAL: Lab = {
  mode: BASE_CONFIG.mode,
  density: BASE_CONFIG.density,
  radius: BASE_CONFIG.radius,
  spaceBase: BASE_CONFIG.spaceBase,
  typeScale: BASE_CONFIG.typeScale,
  brand: BASE_CONFIG.brand,
  platform: BASE_CONFIG.platform,
};

const META: Record<LabKey, { token: string; graph: string | ((l: Lab) => string); derived: (l: Lab) => string[] }> = {
  mode: { token: "mode", graph: (l) => (l.mode === "dark" ? "Dark" : "Light"), derived: () => ["color.surface.default", "color.text.primary", "color.action.primary", "color.border.subtle"] },
  density: { token: "density", graph: "Compact", derived: () => ["size.control.height", "space.inset.control", "type.body.md"] },
  radius: { token: "radius.control", graph: "radius.control", derived: () => ["radius.control", "radius.container"] },
  spaceBase: { token: "space.base", graph: "space.base", derived: () => ["space.100", "space.200", "space.300", "space.400", "space.600", "space.800"] },
  typeScale: { token: "type.scale", graph: "type.body.md", derived: () => ["type.heading.sm", "type.heading.md", "type.heading.lg", "type.heading.xl"] },
  brand: { token: "brand", graph: "color.action.primary", derived: () => ["color.action.primary", "color.action.text", "color.text.onAction"] },
  platform: { token: "platform", graph: (l) => ({ web: "Web", ios: "iOS", android: "Android" })[l.platform], derived: () => ["size.control.height", "radius.control", "size.target.min", "type.body.md"] },
};

const OPTIONS: { key: LabKey; values: (string | number)[]; show?: (v: string | number) => string }[] = [
  { key: "mode", values: ["light", "dark"] },
  { key: "density", values: ["comfortable", "compact"] },
  { key: "spaceBase", values: [2, 4, 6, 8], show: (v) => `${v}` },
  { key: "typeScale", values: [1.125, 1.2, 1.25, 1.333], show: (v) => `${v}` },
  { key: "brand", values: ["a", "b", "c"], show: (v) => BRANDS[v as SystemConfig["brand"]].name },
  { key: "platform", values: ["web", "ios", "android"], show: (v) => (v === "ios" ? "iOS" : v === "android" ? "Android" : "web") },
];

/* derived tokens that are scalar CSS vars need a different read */
function readToken(t: string, c: SystemConfig) {
  if (t.startsWith("type.heading")) {
    const n = { sm: 1, md: 2, lg: 3, xl: 4 }[t.split(".")[2] as "sm"]!;
    return `${(parseFloat(resolveValue("type.body.md", c)) * c.typeScale ** n).toFixed(1)}px`;
  }
  return resolveValue(t, c);
}

export function Lab() {
  return (
    <Scene
      id="lab"
      label="A live laboratory. Change mode, density, radius, space base, type scale, brand or platform. Each change shows the token, what it resolves to, which components depend on it, and the resulting interface. The scope can be this specimen or the entire study."
    >
      {() => <LabBody />}
    </Scene>
  );
}

function LabBody() {
  const { config, setUser, decisions, record } = useSystem();
  const [lab, setLab] = useState<Lab>(INITIAL);
  const [scope, setScope] = useState<"specimen" | "study">("specimen");
  const [last, setLast] = useState<LabKey>("spaceBase");
  const out = useRef<HTMLDivElement>(null);
  const pending = useRef<LabKey | null>(null);

  const resolved = useMemo(() => merge(config, lab), [config, lab]);

  const set = <K extends LabKey>(key: K, value: Lab[K]) => {
    if (lab[key] === value) return;
    const next = { ...lab, [key]: value };
    setLab(next);
    setLast(key);
    pending.current = key;
    if (scope === "study") setUser({ [key]: value }, "lab · entire study");
    else record(META[key].token, String(lab[key]), String(value), "lab · specimen");
  };

  const switchScope = (s: "specimen" | "study") => {
    if (s === scope) return;
    setScope(s);
    if (s === "study") setUser(lab, "lab · scope → entire study");
    else setUser(INITIAL, "lab · scope → specimen");
  };

  const reset = () => {
    setLab(INITIAL);
    if (scope === "study") setUser(INITIAL, "lab · reset");
  };

  // after the system re-resolves, show where the change landed
  const [count, setCount] = useState(0);
  useLayoutEffect(() => {
    const derived = META[last].derived(lab);
    const els = Array.from(new Set(derived.flatMap((t) => consumers(out.current, t))));
    setCount(els.length);
    if (pending.current) {
      pulse(els, out.current?.querySelector(".lab-out__head") ?? null);
      pending.current = null;
    }
  }, [lab, last]);

  const meta = META[last];
  const graphNode = typeof meta.graph === "function" ? meta.graph(lab) : meta.graph;
  const deps = directDependents(graphNode).filter((d) => !d.includes("."));

  return (
    <div className="lab">
      <div className="lab-col lab-input">
        <p className="lab-col__head t-label">01 · input</p>
        <div className="lab-controls">
          {OPTIONS.map((o) => (
            <div key={o.key} className="lab-row" role="group" aria-label={META[o.key].token}>
              <span className="lab-row__name t-mono">{META[o.key].token}</span>
              <span className="lab-row__eq t-mono t-muted">=</span>
              <span className="lab-row__opts">
                {o.values.map((val) => (
                  <button key={String(val)} type="button" className="ctl" aria-pressed={lab[o.key] === val} onClick={() => set(o.key, val as never)}>
                    {o.show ? o.show(val) : String(val)}
                  </button>
                ))}
              </span>
            </div>
          ))}
          <div className="lab-row">
            <label className="lab-row__name t-mono" htmlFor="lab-radius">
              radius.control
            </label>
            <span className="lab-row__eq t-mono t-muted">=</span>
            <span className="lab-row__opts lab-range">
              <input id="lab-radius" className="range" type="range" min={0} max={16} value={lab.radius} onChange={(e) => set("radius", +e.target.value)} />
              <span className="t-mono">{lab.radius}px</span>
            </span>
          </div>
          <div className="lab-row lab-scope" role="group" aria-label="scope">
            <span className="lab-row__name t-mono">scope</span>
            <span className="lab-row__eq t-mono t-muted">=</span>
            <span className="lab-row__opts">
              <button type="button" className="ctl" aria-pressed={scope === "specimen"} onClick={() => switchScope("specimen")}>
                this specimen
              </button>
              <button type="button" className="ctl" aria-pressed={scope === "study"} onClick={() => switchScope("study")}>
                entire study
              </button>
            </span>
          </div>
          <button type="button" className="ctl lab-reset" onClick={reset}>
            reset to v4.0
          </button>
        </div>

        <div className="lab-log">
          <p className="t-label">decision record · this session</p>
          <ol className="t-mono" aria-live="polite">
            {decisions.length === 0 && <li className="t-muted">nothing yet</li>}
            {decisions
              .slice(-7)
              .reverse()
              .map((d) => (
                <li key={d.id}>
                  <span className="t-muted">{d.time}</span> {d.token} <span className="t-muted">{d.from} →</span> {d.to}
                </li>
              ))}
          </ol>
        </div>
      </div>

      <div className="lab-col lab-resolve">
        <p className="lab-col__head t-label">02 · resolution</p>
        <p className="lab-token t-mono">
          {meta.token} = <b>{String(lab[last])}</b>
        </p>
        <span className="lab-arrow t-mono t-muted">↓ resolves</span>
        <ul className="lab-derived t-mono">
          {meta.derived(lab).map((t) => (
            <li key={t}>
              <span>{t}</span>
              <span>{readToken(t, resolved)}</span>
            </li>
          ))}
        </ul>
        <span className="lab-arrow t-mono t-muted">↓ dependencies</span>
        <p className="lab-deps">{deps.join(" · ") || "—"}</p>
        <span className="lab-arrow t-mono t-muted">↓ result</span>
        <p className="lab-count">
          <span className="t-num">{count}</span> <span className="t-label">elements re-resolved {scope === "study" ? "in the specimen — and across the study" : "in the specimen"}</span>
        </p>
      </div>

      <div className="lab-col lab-output">
        <p className="lab-col__head t-label">03 · output</p>
        <SystemScope config={lab} className="lab-out scope-surface">
          <div ref={out} className="lab-out__inner">
            <div className="lab-out__head" data-token="space.400 color.border.subtle">
              <span className="lab-out__brand">Northwind</span>
              <Nav items={["Projects", "Members", "Billing"]} current={1} />
            </div>
            <div className="lab-out__body" data-token="space.600">
              <span className="lab-out__title" data-token="type.heading.md">
                Members
              </span>
              <span className="lab-out__sub">Invite people and decide what they can change.</span>
              <span className="lab-out__invite" data-token="space.200">
                <Field inert label="Email" placeholder="name@domain.com" />
                <Button inert icon="plus">
                  Invite
                </Button>
              </span>
              <Table
                head={["Member", "Role", "Since"]}
                rows={[
                  ["Ada Park", "Admin", "2022"],
                  ["Kai Osei", "Editor", "2023"],
                  ["Mia Reyes", "Viewer", "2024"],
                ]}
                selected={1}
              />
              <span className="lab-out__row" data-token="space.300">
                <Toggle inert label="Require 2FA" checked />
                <Checkbox inert label="Notify on join" checked />
                <Tag>3 seats left</Tag>
              </span>
              <span className="lab-out__row lab-out__menu" data-token="space.300">
                <Menu items={[["Change role", "R"], ["Remove", "⌫"]]} active={0} />
                <Toast>Kai is now an Editor.</Toast>
              </span>
            </div>
          </div>
        </SystemScope>
      </div>
    </div>
  );
}
