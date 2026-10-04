"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Scene, useDesktop } from "@/hooks/scene";
import { useWires, WireLayer, type WireSpec } from "@/hooks/wires";
import { SystemScope, useSystem } from "@/system/SystemProvider";
import { contrast, merge, resolveChain, resolveValue, type SystemConfig } from "@/system/tokens";
import { Button, Checkbox, Field, Icon, Nav, Tag, Toggle } from "@/ui/kit";

const PRODUCTS: { id: string; name: string; kind: string; config: Partial<SystemConfig> }[] = [
  { id: "a", name: "Atlas", kind: "operations console · dense", config: { brand: "a", density: "compact", radius: 0, mode: "light" } },
  { id: "b", name: "Tend", kind: "consumer app · touch", config: { brand: "b", density: "comfortable", radius: 8, platform: "ios", mode: "light" } },
  { id: "c", name: "Field Notes", kind: "editorial · reading", config: { brand: "c", density: "comfortable", radius: 0, mode: "dark", spaceBase: 5 } },
];

const RULES: { token: string; label: string; why: string }[] = [
  { token: "color.action.primary", label: "color.action.primary", why: "One meaning: the main action. Three brand values." },
  { token: "color.focus.ring", label: "focus.ring", why: "Same behaviour everywhere: visible, ≥ 3:1, never removed." },
  { token: "radius.control", label: "radius.control", why: "One decision point. Each product sets its own value." },
  { token: "size.control.height", label: "size.control.height", why: "Density and platform change it; the component never knows." },
  { token: "type.body.md", label: "type.body.md", why: "Reading size follows platform and density rules." },
];

export function Sameness() {
  return (
    <Scene
      id="sameness"
      label="Three products — a dense operations console, a touch consumer app and a dark editorial site — share tokens, primitives, interaction rules and accessibility logic, and still look different. Consistency is not sameness."
    >
      {() => <SamenessBody />}
    </Scene>
  );
}

function SamenessBody() {
  const desktop = useDesktop();
  const { config } = useSystem();
  const root = useRef<HTMLDivElement>(null);
  const [rule, setRule] = useState(RULES[0].token);

  const resolved = useMemo(() => PRODUCTS.map((p) => merge(config, p.config, { motion: config.motion })), [config]);

  useEffect(() => {
    const els = Array.from(root.current?.querySelectorAll(`.same-product [data-token~="${rule}"]`) ?? []);
    els.forEach((e) => e.classList.add("flagged"));
    return () => els.forEach((e) => e.classList.remove("flagged"));
  }, [rule]);

  const specs = useMemo<WireSpec[]>(
    () =>
      PRODUCTS.map((p) => ({
        key: `r-${p.id}`,
        from: `[data-rule="${rule}"]`,
        to: `[data-readout="${p.id}"]`,
        route: "v",
        tone: "action",
        bend: 0.5,
        dot: true,
      })),
    [rule],
  );
  const { paths } = useWires(root, desktop ? specs : [], `${rule}${desktop}`);

  return (
    <div ref={root} className="same">
      <WireLayer paths={paths} />
      <h3 className="same-statement t-display">
        Consistency <span className="t-accent">≠</span>
        <br />
        sameness
      </h3>

      <div className="same-products">
        {PRODUCTS.map((p, i) => {
          const c = resolved[i];
          const chain = resolveChain(rule, c);
          const val = chain[chain.length - 1];
          return (
            <figure key={p.id} className="same-product" data-p={p.id}>
              <figcaption className="same-product__cap">
                <span className="same-product__name">{p.name}</span>
                <span className="t-label">{p.kind}</span>
              </figcaption>
              <SystemScope config={p.config} className="same-scope scope-surface">
                <Product id={p.id} />
              </SystemScope>
              <p className="same-readout t-mono" data-readout={p.id}>
                <span className="t-muted">{rule} →</span> {chain.length > 1 ? `${chain.slice(1).map((l) => l.name).join(" → ")} ` : ""}
                <b>{val.value}</b>
                <br />
                <span className="t-muted">
                  text {contrast(resolveValue("color.text.primary", c), resolveValue("color.surface.default", c)).toFixed(1)}:1 · action label{" "}
                  {contrast(resolveValue("color.text.onAction", c), resolveValue("color.action.primary", c)).toFixed(1)}:1
                </span>
              </p>
            </figure>
          );
        })}
      </div>

      <div className="same-rules" role="group" aria-label="Shared rules">
        <span className="t-label">shared · select a rule</span>
        <div className="same-rules__list">
          {RULES.map((r) => (
            <button key={r.token} type="button" className="ctl" data-rule={r.token} aria-pressed={rule === r.token} onClick={() => setRule(r.token)}>
              {r.label}
            </button>
          ))}
        </div>
        <p className="t-essay">
          {RULES.find((r) => r.token === rule)!.why} The products share <em>tokens, primitives, interaction rules and accessibility
          logic</em> — not a look.
        </p>
      </div>
    </div>
  );
}

function Product({ id }: { id: string }) {
  if (id === "a")
    return (
      <div className="pa">
        <div className="pa-bar">
          <Nav items={["Fleet", "Routes", "Incidents", "Reports"]} current={2} />
          <Button size="sm" icon="plus">
            Incident
          </Button>
        </div>
        <div className="pa-filters">
          <Field inert icon="search" placeholder="Filter 1,204 incidents" />
          <Tag tone="neutral">Region: North</Tag>
          <Tag>Open</Tag>
        </div>
        <div className="pa-table" data-token="space.200 color.border.subtle type.body.md">
          {[
            ["#4471", "Sensor offline", "Depot 7", "P2"],
            ["#4470", "Late departure", "Route 12", "P3"],
            ["#4468", "Door fault", "Unit 31", "P1"],
            ["#4467", "GPS drift", "Unit 08", "P3"],
          ].map((r, i) => (
            <span key={r[0]} className="pa-row" data-sel={i === 2 || undefined}>
              <Checkbox inert label="" checked={i === 2} />
              <span className="t-mono-ui">{r[0]}</span>
              <span>{r[1]}</span>
              <span className="t-muted">{r[2]}</span>
              <span className="pa-p">{r[3]}</span>
            </span>
          ))}
        </div>
        <div className="pa-actions">
          <Button size="sm" intent="secondary">
            Assign
          </Button>
          <Button size="sm">Resolve</Button>
        </div>
      </div>
    );
  if (id === "b")
    return (
      <div className="pb">
        <span className="pb-hello">Good morning, Ana</span>
        <span className="pb-sub">3 of 4 habits done this week.</span>
        <span className="pb-meter" data-token="color.action.primary radius.control">
          <span style={{ width: "75%" }} />
        </span>
        <div className="pb-list">
          <Toggle label="Walk after lunch" defaultChecked hint="12 days" />
          <Toggle label="Read 20 pages" hint="4 days" />
          <Toggle label="No phone after 22:00" defaultChecked hint="7 days" />
        </div>
        <Button size="lg">Log today</Button>
      </div>
    );
  return (
    <div className="pc">
      <span className="pc-kicker t-label">Essay · 12 min</span>
      <span className="pc-title">The quiet infrastructure of cities</span>
      <span className="pc-deck">How shared rules let a thousand buildings disagree without falling apart.</span>
      <span className="pc-tags">
        <Tag>Urbanism</Tag>
        <Tag>Systems</Tag>
      </span>
      <span className="pc-sub">
        <Field inert placeholder="you@domain.com" label="The weekly letter" />
        <Button intent="primary" iconEnd="arrow">
          Subscribe
        </Button>
      </span>
      <span className="pc-foot t-mono">
        <Icon name="bell" /> no tracking · unsubscribe anytime
      </span>
    </div>
  );
}
