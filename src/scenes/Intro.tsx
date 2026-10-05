"use client";

import { useEffect, useMemo, useRef } from "react";
import { Scene, useDesktop, Views } from "@/hooks/scene";
import { IntroM } from "./mobile/IntroM";
import { useWires, WireLayer, type WireSpec } from "@/hooks/wires";
import { SystemScope } from "@/system/SystemProvider";
import { consumers, pulse } from "@/system/pulse";
import { Button, Checkbox, Dialog, Field, Menu, Nav, Tag, Toggle, Tooltip, Icon } from "@/ui/kit";

/** element id → [left%, top%] on desktop, mobile; tokens it consumes */
const ELEMENTS: {
  id: string;
  caption: string;
  d: [number, number];
  m?: [number, number];
  uses: ("action" | "radius" | "space")[];
}[] = [
  { id: "button", caption: "button", d: [7, 6], m: [4, 4], uses: ["action", "radius", "space"] },
  { id: "input", caption: "input", d: [29, 14], m: [44, 2], uses: ["radius", "space"] },
  { id: "nav", caption: "navigation", d: [56, 2], uses: ["action", "space"] },
  { id: "toggle", caption: "toggle", d: [84, 18], m: [62, 22], uses: ["action"] },
  { id: "tag", caption: "tag", d: [11, 66], m: [6, 64], uses: ["action", "radius"] },
  { id: "row", caption: "table row", d: [27, 76], m: [4, 80], uses: ["action", "space"] },
  { id: "tooltip", caption: "tooltip", d: [52, 64], uses: ["radius"] },
  { id: "dialog", caption: "dialog", d: [62, 72], uses: ["radius", "space"] },
  { id: "menu", caption: "menu item", d: [85, 62], m: [52, 62], uses: ["action", "radius", "space"] },
];

const TOKENS = {
  action: { name: "color.action.primary", d: 12, m: 0 },
  radius: { name: "radius.control", d: 42, m: 39 },
  space: { name: "space.200", d: 70, m: 76 },
} as const;

function Specimen({ id }: { id: string }) {
  switch (id) {
    case "button":
      return (
        <Button inert icon="check">
          Save draft
        </Button>
      );
    case "input":
      return <Field inert label="Email" value="ada@studio.io" style={{ width: 200 }} />;
    case "nav":
      return <Nav items={["Overview", "Activity", "Settings"]} current={0} />;
    case "toggle":
      return <Toggle inert label="Sync" checked />;
    case "tag":
      return <Tag>Beta</Tag>;
    case "row":
      return (
        <span className="intro-row" data-token="color.action.subtle space.200" aria-hidden="true">
          <Checkbox inert label="" checked />
          <span className="t-mono-ui">INV-2041</span>
          <span>Paid</span>
          <span className="t-num">€1,240.00</span>
        </span>
      );
    case "tooltip":
      return <Tooltip>Copied</Tooltip>;
    case "dialog":
      return <Dialog title="Discard changes?" primary="Discard" secondary="Keep" />;
    case "menu":
      return <Menu items={[["Duplicate", "⌘D"], ["Archive"]]} active={0} />;
  }
  return null;
}

export function Intro() {
  return (
    <Scene
      id="intro"
      label="Nine interface elements that appear independent are connected by three shared tokens: an action colour, a control radius and a spacing step. When the radius changes, every connected element changes."
    >
      {({ step }) => (
        <>
          <h1 className="sr-only">Design systems — a study by Victor Maragioglio</h1>
          <Views desktop={<IntroStage step={step} />} mobile={<IntroM step={step} />} />
        </>
      )}
    </Scene>
  );
}

function IntroStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const field = useRef<HTMLDivElement>(null);
  const radiusNode = useRef<HTMLSpanElement>(null);
  const els = desktop ? ELEMENTS : ELEMENTS.filter((e) => e.m);

  const specs = useMemo<WireSpec[]>(() => {
    const out: WireSpec[] = [];
    for (const e of els)
      for (const u of e.uses) {
        const on = u === "action" ? step >= 1 && step < 4 : step >= 2 && step < 4;
        out.push({
          key: `${u}-${e.id}`,
          from: `[data-w="t-${u}"]`,
          to: `[data-w="${e.id}"] > .intro-el__body`,
          on,
          tone: u === "action" ? "action" : u === "radius" ? "strong" : undefined,
          route: "v",
          bend: u === "action" ? 0.25 : u === "radius" ? 0.5 : 0.75,
          dot: true,
        });
      }
    return out;
  }, [els, step]);
  const { paths } = useWires(field, specs, desktop);

  useEffect(() => {
    if (step === 3) pulse(consumers(field.current, "radius.control"), radiusNode.current);
  }, [step]);

  const radius = step === 3 ? 8 : undefined;

  return (
    <div className="intro">
      <SystemScope config={{ radius }} className="intro-field">
        <div ref={field} className="intro-field__inner">
          <WireLayer paths={paths} />
          {els.map((e) => {
            const [x, y] = desktop ? e.d : e.m!;
            return (
              <div key={e.id} className="intro-el dim" data-w={e.id} data-dim={step === 4 ? "strong" : step === 3} style={{ left: `${x}%`, top: `${y}%` }}>
                <span className="t-label intro-el__cap">{e.caption}</span>
                <span className="intro-el__body">
                  <Specimen id={e.id} />
                </span>
              </div>
            );
          })}
          <div className="intro-band fade" data-on={step >= 1 && step < 4}>
            {(Object.keys(TOKENS) as (keyof typeof TOKENS)[]).map((k) => (
              <span
                key={k}
                ref={k === "radius" ? radiusNode : undefined}
                className="token-node fade"
                data-on={k === "action" ? step >= 1 : step >= 2}
                data-active={(k === "radius" && step === 3) || (k === "action" && step === 1)}
                data-w={`t-${k}`}
                style={{ left: `${desktop ? TOKENS[k].d : TOKENS[k].m}%` }}
              >
                {k === "action" && <span className="token-node__swatch" style={{ ["--sw" as string]: "var(--color-action-primary)" }} />}
                {k === "radius" && <Icon name="grid" size={10} />}
                {desktop ? TOKENS[k].name : TOKENS[k].name.replace("color.", "")}
                {k === "radius" && <span className="t-muted">{step === 3 ? "= 8px" : "= 2px"}</span>}
              </span>
            ))}
          </div>
        </div>
      </SystemScope>

      <p className="intro-hint t-essay fade" data-on={step === 0}>
        Nine interface elements. Apparently unrelated.
        <span className="t-label" style={{ display: "block", marginTop: 12 }}>
          Scroll — or press ▶ Present
        </span>
      </p>

      <p className="intro-statement t-display fade" data-on={step === 3} aria-hidden={step !== 3}>
        Nothing here
        <br />
        is independent.
      </p>

      <div className="intro-title fade" data-on={step === 4}>
        <p className="t-display" aria-hidden="true">
          Design
          <br />
          systems
        </p>
        <div className="intro-author">
          <p className="t-essay">
            How shared decisions create consistency, propagate change, drift, get governed — and evolve.
          </p>
          <p className="t-label">
            A study by{" "}
            <a href="https://victormaragioglio.com" className="intro-author__link">
              Victor Maragioglio
            </a>
          </p>
          <p className="t-label">
            <a href="https://victormaragioglio.com" className="intro-author__link">
              victormaragioglio.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
