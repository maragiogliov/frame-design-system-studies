"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Scene, useDesktop, useStepOverride } from "@/hooks/scene";
import { useWires, WireLayer, type WireSpec } from "@/hooks/wires";
import { SystemScope } from "@/system/SystemProvider";
import { consumers, pulse } from "@/system/pulse";
import { BRANDS, PRIMITIVES, type Brand } from "@/system/tokens";
import { Button, Checkbox, DatePicker, Dialog, Field, Nav, Table, Toast, Toggle, Tag } from "@/ui/kit";

type Tok = "color.action.primary" | "radius.control" | "space.base";
interface Decision {
  brand: Brand;
  radius: number;
  space: number;
  focus: Tok;
}

const BY_STEP: Decision[] = [
  { brand: "a", radius: 2, space: 4, focus: "color.action.primary" },
  { brand: "a", radius: 2, space: 4, focus: "color.action.primary" },
  { brand: "b", radius: 2, space: 4, focus: "color.action.primary" },
  { brand: "b", radius: 8, space: 4, focus: "radius.control" },
  { brand: "b", radius: 8, space: 6, focus: "space.base" },
];

const SWATCH: { brand: Brand; primitive: keyof typeof PRIMITIVES }[] = [
  { brand: "a", primitive: "vermilion.600" },
  { brand: "b", primitive: "moss.600" },
  { brand: "c", primitive: "ochre.500" },
  { brand: "mono", primitive: "ink.900" },
];

/** space.base is consumed through the space.* scale */
const SELECTOR: Record<Tok, string> = {
  "color.action.primary": '[data-token~="color.action.primary"]',
  "radius.control": '[data-token~="radius.control"]',
  "space.base":
    '[data-token~="space.100"],[data-token~="space.200"],[data-token~="space.300"],[data-token~="space.400"],[data-token~="space.600"],[data-token~="space.inset.control"]',
};

const FRAGMENTS = ["nav", "form", "table", "dialog", "date", "buttons", "toast"] as const;
const MOBILE = new Set(["nav", "buttons", "toast", "table"]);

export function Propagation() {
  return (
    <Scene
      id="propagation"
      label="Seven unrelated interface fragments — navigation, form, table, dialog, date picker, button group and toast — all reference the same tokens. Changing color.action.primary, radius.control or space.base changes every consumer at once. The number of consumers is counted live."
    >
      {({ step }) => <PropagationStage step={step} />}
    </Scene>
  );
}

function PropagationStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const field = useRef<HTMLDivElement>(null);
  const controls = useRef<Record<Tok, HTMLElement | null>>({ "color.action.primary": null, "radius.control": null, "space.base": null });
  const [d, setD] = useStepOverride<Decision>(step, (s) => BY_STEP[s]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);

  // consequences are counted from the DOM, not typed
  useLayoutEffect(() => {
    const root = field.current;
    if (!root) return;
    const c: Record<string, number> = {};
    root.querySelectorAll<HTMLElement>("[data-frag]").forEach((f) => (c[f.dataset.frag!] = f.querySelectorAll(SELECTOR[d.focus]).length));
    setCounts(c);
    setTotal(root.querySelectorAll(SELECTOR[d.focus]).length);
  }, [d.focus, desktop, d.space, d.radius, d.brand]);

  // propagate: pulse every consumer of the token that changed
  const prev = useRef(d);
  useEffect(() => {
    const p = prev.current;
    prev.current = d;
    const changed: Tok | null =
      p.brand !== d.brand ? "color.action.primary" : p.radius !== d.radius ? "radius.control" : p.space !== d.space ? "space.base" : null;
    if (!changed || !field.current) return;
    const targets = Array.from(field.current.querySelectorAll(SELECTOR[changed]));
    pulse(targets, controls.current[changed]);
  }, [d]);

  const set = (patch: Partial<Decision>, focus: Tok) => setD({ ...d, ...patch, focus });

  const specs = useMemo<WireSpec[]>(
    () =>
      FRAGMENTS.map((f) => ({
        key: `w-${f}`,
        from: `[data-ctl="${d.focus}"]`,
        to: `[data-frag="${f}"] .prop-frag__cap`,
        on: step >= 1 && (counts[f] ?? 0) > 0,
        tone: "action" as const,
        route: "h" as const,
        trunk: 20,
        toSide: "left" as const,
      })),
    [d.focus, step, counts],
  );
  const wireRoot = useRef<HTMLDivElement>(null);
  const { paths } = useWires(wireRoot, desktop ? specs : [], `${d.focus}${d.space}${d.radius}`);

  const scope = useMemo(() => ({ brand: d.brand, radius: d.radius, spaceBase: d.space }), [d.brand, d.radius, d.space]);

  return (
    <div ref={wireRoot} className="prop">
      <WireLayer paths={paths} />
      <div className="prop-controls" role="group" aria-label="Shared tokens">
        <fieldset className="prop-ctl" data-ctl="color.action.primary" ref={(el) => void (controls.current["color.action.primary"] = el)}>
          <legend className="t-mono">color.action.primary</legend>
          <div className="prop-swatches">
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
          <span className="t-mono t-muted">→ {SWATCH.find((s) => s.brand === d.brand)?.primitive}</span>
        </fieldset>

        <fieldset className="prop-ctl" data-ctl="radius.control" ref={(el) => void (controls.current["radius.control"] = el)}>
          <legend className="t-mono">radius.control</legend>
          <input
            className="range"
            type="range"
            min={0}
            max={12}
            step={1}
            value={d.radius}
            aria-label="radius.control in pixels"
            onChange={(e) => set({ radius: +e.target.value }, "radius.control")}
          />
          <span className="t-mono t-muted">= {d.radius}px</span>
        </fieldset>

        <fieldset className="prop-ctl" data-ctl="space.base" ref={(el) => void (controls.current["space.base"] = el)}>
          <legend className="t-mono">space.base</legend>
          <div>
            {[4, 6, 8].map((n) => (
              <button key={n} type="button" className="ctl" aria-pressed={d.space === n} onClick={() => set({ space: n }, "space.base")}>
                {n}px
              </button>
            ))}
          </div>
        </fieldset>

        <div className="prop-count fade" data-on={step >= 1}>
          <span className="t-label">one decision</span>
          <span className="prop-count__n t-num" aria-live="polite">
            <span className="t-muted">1 →</span> {total}
          </span>
          <span className="t-label">consequences of {d.focus}</span>
        </div>
      </div>

      <SystemScope config={scope} className="prop-field scope-surface">
        <div ref={field} className="prop-field__inner">
          {FRAGMENTS.filter((f) => desktop || MOBILE.has(f)).map((f) => (
            <div key={f} className="prop-frag" data-frag={f}>
              <span className="prop-frag__cap t-label">
                {f} <span className="t-accent">{step >= 1 && counts[f] ? `×${counts[f]}` : ""}</span>
              </span>
              <Fragment id={f} />
            </div>
          ))}
        </div>
      </SystemScope>
    </div>
  );
}

function Fragment({ id }: { id: (typeof FRAGMENTS)[number] }) {
  switch (id) {
    case "nav":
      return (
        <span className="prop-nav">
          <Nav items={["Projects", "Reviews", "Members", "Billing"]} current={1} />
          <Button inert size="sm" intent="secondary" icon="plus">
            New
          </Button>
        </span>
      );
    case "form":
      return (
        <span className="prop-form" data-token="space.400">
          <Field inert label="Workspace name" value="North studio" />
          <Field inert label="Billing email" value="" placeholder="name@domain.com" hint="Invoices go here." />
          <Checkbox inert label="Send weekly summary" checked />
          <Button inert>Create workspace</Button>
        </span>
      );
    case "table":
      return (
        <Table
          rows={[
            ["INV-2039", "Draft", "€320.00"],
            ["INV-2040", "Sent", "€1,240.00"],
            ["INV-2041", "Paid", "€88.50"],
          ]}
          selected={1}
        />
      );
    case "dialog":
      return <Dialog title="Remove member?" body="They lose access to 4 projects." primary="Remove" secondary="Cancel" />;
    case "date":
      return <DatePicker selected={14} range={[14, 18]} />;
    case "buttons":
      return (
        <span className="prop-buttons" data-token="space.200">
          <Button inert>Publish</Button>
          <Button inert intent="secondary">
            Preview
          </Button>
          <Button inert intent="ghost">
            Discard
          </Button>
          <Toggle inert label="Auto-save" checked />
          <Tag>Beta</Tag>
        </span>
      );
    case "toast":
      return <Toast>Invoice INV-2040 sent.</Toast>;
  }
}
