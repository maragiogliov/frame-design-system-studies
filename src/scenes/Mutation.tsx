"use client";

import { useEffect, useMemo } from "react";
import { Scene } from "@/hooks/scene";
import { SystemScope, useSystem } from "@/system/SystemProvider";
import { BRANDS, colorRefs, merge, scalars, type SystemConfig } from "@/system/tokens";
import { Button, Checkbox, Field, Tag, Toggle } from "@/ui/kit";

interface Version {
  v: string;
  title: string;
  log: string[];
  override: Partial<SystemConfig>;
  outputs: { label: string; config: Partial<SystemConfig> }[];
}

const VERSIONS: Version[] = [
  {
    v: "1.0",
    title: "One product, one team",
    log: ["radius 2px", "spacing base 4px", "button height 32px", "monochrome brand", "focus: browser default"],
    override: { version: "1.0", brand: "mono", controlHeight: 32, focus: "legacy" },
    outputs: [{ label: "web", config: {} }],
  },
  {
    v: "1.4",
    title: "Accessibility requirements",
    log: ["focus ring: 2px, 2px offset, ≥ 3:1", "disabled text no longer relies on opacity", "targets ≥ 24px", "components unchanged structurally"],
    override: { version: "1.4", brand: "mono", controlHeight: 32, focus: "ring" },
    outputs: [{ label: "web", config: {} }],
  },
  {
    v: "2.0",
    title: "Brand redesign",
    log: ["color.action.primary → vermilion", "display type widens (wdth 112)", "button height 36px", "0 component API changes"],
    override: { version: "2.0", brand: "a" },
    outputs: [{ label: "web", config: {} }],
  },
  {
    v: "3.0",
    title: "Mobile platform",
    log: ["size.control.height diverges: 36 web · 44 iOS", "radius.control diverges: 2 web · 10 iOS", "type.body.md: 16 web · 17 iOS", "semantic colour layer shared as-is"],
    override: { version: "3.0", brand: "a" },
    outputs: [
      { label: "web", config: {} },
      { label: "iOS", config: { platform: "ios" } },
    ],
  },
  {
    v: "4.0",
    title: "Multi-brand architecture",
    log: ["one semantic layer, three brand maps", "brand decides hue and type; system decides contrast", "products choose a brand, not colours", "this page: brand A"],
    override: { version: "4.0", brand: "a" },
    outputs: [
      { label: "brand A", config: { brand: "a" } },
      { label: "brand B", config: { brand: "b" } },
      { label: "brand C", config: { brand: "c" } },
    ],
  },
];

/** Token diff between two versions, computed from the resolver. */
function diff(a: SystemConfig, b: SystemConfig) {
  const out: [string, string, string][] = [];
  const ca = colorRefs(a);
  const cb = colorRefs(b);
  for (const k of ["color.action.primary", "color.text.onAction", "color.focus.ring"] as const)
    if (ca[k] !== cb[k]) out.push([k, ca[k], cb[k]]);
  const sa = scalars(a) as unknown as Record<string, number>;
  const sb = scalars(b) as unknown as Record<string, number>;
  for (const k of ["size.control.height", "radius.control", "focus.ring.width", "type.display.width", "type.display.weight"])
    if (sa[k] !== sb[k]) out.push([k, String(sa[k]), String(sb[k])]);
  return out;
}

export function Mutation() {
  return (
    <Scene
      id="mutation"
      label="The whole page mutates through five versions of its own design system: v1.0 monochrome with 2px radius and 32px controls; v1.4 adds accessible focus states; v2.0 a brand redesign with no component API changes; v3.0 introduces a mobile platform where some primitives diverge; v4.0 a multi-brand architecture on one semantic layer. The page you have been reading is v4.0."
    >
      {({ step, active }) => <MutationStage step={step} active={active} />}
    </Scene>
  );
}

function MutationStage({ step, active }: { step: number; active: boolean }) {
  const { setSceneOverride, user, config } = useSystem();
  const ver = VERSIONS[step];

  // The entire page re-resolves while this scene is in range.
  useEffect(() => {
    setSceneOverride(active ? ver.override : null);
  }, [active, ver, setSceneOverride]);
  useEffect(() => () => setSceneOverride(null), [setSceneOverride]);

  const changes = useMemo(() => {
    if (step === 0) return [];
    // diff the versions themselves, independent of the override currently applied to the page
    const a11y = { contrast: config.contrast, motion: config.motion };
    return diff(merge(user, VERSIONS[step - 1].override, a11y), merge(user, ver.override, a11y));
  }, [step, ver, user, config.contrast, config.motion]);

  return (
    <div className="mut">
      <div className="mut-head">
        <p className="mut-v t-display" aria-live="polite">
          v{ver.v}
        </p>
        <p className="mut-title t-heading">{ver.title}</p>
        <p className="t-essay">
          {step < 4 ? (
            <>
              Look at the page around you — the rail, the headings, the readout. <em>The whole study is running v{ver.v}.</em>
            </>
          ) : (
            <>
              The page you have been reading was v4.0 all along. Same logic, different resolved system.{" "}
              <em className="t-accent">The system remembers.</em>
            </>
          )}
        </p>
      </div>

      <div className="mut-body">
        <ul className="mut-log">
          {ver.log.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>

        <table className="mut-diff t-mono">
          <caption className="t-label">resolved diff from v{step === 0 ? "—" : VERSIONS[step - 1].v}</caption>
          <tbody>
            {changes.length === 0 && (
              <tr>
                <td colSpan={3} className="t-muted">
                  {step === 0 ? "initial release" : "no shared token changed — divergence is per platform"}
                </td>
              </tr>
            )}
            {changes.map(([k, a, b]) => (
              <tr key={k}>
                <th scope="row">{k}</th>
                <td className="t-muted">{a}</td>
                <td>→ {b}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mut-outputs">
          {ver.outputs.map((o) => (
            <SystemScope key={o.label} config={{ ...ver.override, ...o.config }} className="mut-out scope-surface">
              <span className="t-label">{o.label}</span>
              <span className="mut-out__row">
                <Button inert>Publish</Button>
                <Button inert intent="secondary">
                  Preview
                </Button>
              </span>
              <span className="mut-out__row">
                <Button inert state="focus" intent="secondary">
                  Focused
                </Button>
                <Tag>{o.config.brand ? BRANDS[o.config.brand].name : `v${ver.v}`}</Tag>
              </span>
              <Field inert value="Release notes" />
              <span className="mut-out__row">
                <Checkbox inert label="Notify" checked />
                <Toggle inert label="Public" checked />
              </span>
            </SystemScope>
          ))}
        </div>
      </div>

      <ol className="mut-time t-mono" aria-label="Versions">
        {VERSIONS.map((x, i) => (
          <li key={x.v} data-now={i === step} data-past={i < step} aria-current={i === step ? "step" : undefined}>
            <span>v{x.v}</span>
            <span className="t-muted">{x.title}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
