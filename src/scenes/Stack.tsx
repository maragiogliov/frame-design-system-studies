"use client";

import { Scene, useDesktop } from "@/hooks/scene";
import { SystemScope } from "@/system/SystemProvider";
import { Button, Field, Icon, cx } from "@/ui/kit";

const LAYERS = [
  { id: "brand", name: "Brand", sub: "who we are" },
  { id: "foundations", name: "Foundations", sub: "colour · type · grid" },
  { id: "tokens", name: "Design tokens", sub: "named decisions" },
  { id: "primitives", name: "Primitives", sub: "smallest parts" },
  { id: "components", name: "Components", sub: "parts + behaviour" },
  { id: "patterns", name: "Patterns", sub: "compositions with intent" },
  { id: "product", name: "Product experiences", sub: "what people use" },
] as const;

type Layer = (typeof LAYERS)[number]["id"];

const FORCES = ["accessibility", "content", "platform", "responsiveness", "governance"] as const;
type Force = (typeof FORCES)[number];

const EFFECT: Record<Force, Partial<Record<Layer, string>>> = {
  accessibility: {
    brand: "brand red needs a darker text variant to reach 4.5:1",
    foundations: "contrast pairs are defined, not picked",
    tokens: "+ color.focus.ring  + size.target.min",
    primitives: "the focus ring becomes a primitive",
    components: "visible label, focus ring, 24px targets",
    patterns: "errors in words, linked to their field",
    product: "landmarks, heading order, skip link",
  },
  content: {
    brand: "voice: plain, specific, unhurried",
    foundations: "type scale tuned for a 70ch measure",
    components: "labels are verb + object",
    patterns: "errors say how to fix, not what failed",
    product: "empty states are written, not illustrated",
  },
  platform: {
    foundations: "17pt body on iOS",
    tokens: "size.control.height → 36 web / 44 iOS / 40 Android",
    primitives: "icon sets differ per platform",
    components: "touch targets 44pt",
    patterns: "native date input on mobile",
    product: "two navigation models",
  },
  responsiveness: {
    brand: "wordmark needs a compact form",
    foundations: "fluid type between breakpoints",
    tokens: "space scale fixed; layout tokens vary",
    components: "full-width actions below 480px",
    patterns: "fields stack, actions follow",
    product: "sidebar collapses to a menu",
  },
  governance: {
    brand: "owner: brand studio",
    foundations: "owner: system team · RFC to change",
    tokens: "semver · renames ship with aliases",
    primitives: "owner: system team",
    components: "v4.2.0 · deprecations announced two minors ahead",
    patterns: "documented with when-not-to-use",
    product: "owned by product teams · adopts on its own schedule",
  },
};

export function Stack() {
  return (
    <Scene
      id="stack"
      label="A seven-layer stack from brand to product experiences. Five forces — accessibility, content, platform, responsiveness and governance — cut across every layer and change each layer's artifact."
    >
      {({ step }) => <StackStage step={step} />}
    </Scene>
  );
}

function StackStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const activeForce: Force | null = step >= 1 && step <= 5 ? FORCES[step - 1] : null;
  const on = new Set<Force>(FORCES.slice(0, Math.min(step, 5)));
  const summary = step === 6;

  return (
    <div className="stack">
      <div className="stack-forces" aria-hidden="true">
        {FORCES.map((f, i) => (
          <span key={f} className="stack-force" data-on={on.has(f)} data-active={f === activeForce || summary}>
            <span className="stack-force__label">{f}</span>
            <span className="stack-force__line" />
            {LAYERS.map((l) => (
              <span key={l.id} className="stack-force__dot" data-hit={!!EFFECT[f][l.id]} style={{ gridRow: LAYERS.indexOf(l) + 2 }} />
            ))}
            <span className="sr-only">{i}</span>
          </span>
        ))}
      </div>

      <ol className="stack-layers">
        {LAYERS.map((l, i) => {
          const count = FORCES.filter((f) => EFFECT[f][l.id]).length;
          const effect = activeForce ? EFFECT[activeForce][l.id] : undefined;
          return (
            <li key={l.id} className="stack-row" style={{ ["--i" as string]: i }}>
              <span className="stack-row__name">
                <span className="t-mono t-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="stack-row__title">{l.name}</span>
                <span className="t-label">{l.sub}</span>
              </span>
              {(desktop || l.id === "product") && (
                <span className="stack-row__artifact">
                  <Artifact layer={l.id} on={on} />
                </span>
              )}
              <span className="stack-row__effect t-mono" data-empty={!effect && !summary}>
                {summary ? (
                  <>
                    <b>{count}</b> of 5 forces
                  </>
                ) : (
                  effect ?? (activeForce ? "— untouched" : "")
                )}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="stack-caption t-essay">
        {step === 0 && (
          <>
            Each layer consumes the one above. <em>Brand does not reach the product directly</em> — it arrives as
            foundations, then tokens, then parts.
          </>
        )}
        {activeForce && (
          <>
            <em className="t-accent">{activeForce}</em> is not a layer. It cuts through all of them — and not evenly.
          </>
        )}
        {summary && <>Forces cut across every layer. A stack diagram without them describes a system nobody uses.</>}
      </p>
    </div>
  );
}

function Artifact({ layer, on }: { layer: Layer; on: Set<Force> }) {
  const a11y = on.has("accessibility");
  const content = on.has("content");
  const platform = on.has("platform");
  const resp = on.has("responsiveness");
  const gov = on.has("governance");
  const govTag = (t: string) => gov && <span className="stack-gov t-mono">{t}</span>;

  switch (layer) {
    case "brand":
      return (
        <span className="art-row">
          <span className="art-wordmark">{resp ? "Fn" : "Fieldnote"}</span>
          <span className="art-chip" style={{ background: "var(--color-action-primary)" }} />
          {a11y && <span className="t-mono t-muted">text: vermilion.600 · 4.6:1</span>}
          {govTag("brand studio")}
        </span>
      );
    case "foundations":
      return (
        <span className="art-row">
          {["ink.900", "ink.500", "ink.200", "paper.50", "vermilion.600"].map((p) => (
            <span key={p} className="art-swatch" title={p} style={{ background: `var(--p-${p.replace(".", "-")})` }} />
          ))}
          <span className="art-type">Aa {platform ? "17" : "16"}/1.45</span>
          <span className="t-mono t-muted">grid 4</span>
          {a11y && <span className="t-mono t-muted">pairs ≥ 4.5:1</span>}
          {govTag("RFC")}
        </span>
      );
    case "tokens":
      return (
        <span className="art-row t-mono art-tokens">
          <span>color.action.primary → vermilion.600</span>
          {a11y && <span className="t-accent">color.focus.ring</span>}
          {platform && <span className="t-accent">size.control.height.ios = 44</span>}
          {govTag("v4.2.0")}
        </span>
      );
    case "primitives":
      return (
        <span className="art-row">
          <span className="art-prim" data-k="surface" />
          <span className="art-type">Aa</span>
          <Icon name="arrow" />
          <span className="art-prim" data-k="border" />
          {a11y && <span className="art-prim" data-k="focus" />}
          {govTag("system team")}
        </span>
      );
    case "components":
      return (
        <SystemScope config={platform ? { platform: "ios" } : {}} className="art-row">
          <span className={cx(resp && "art-narrow")}>
            <Button inert size="sm" state={a11y ? "focus" : undefined}>
              {content ? "Save changes" : "Submit"}
            </Button>
          </span>
          <Field inert value="" placeholder={a11y ? "" : "Email"} label={a11y ? "Email" : undefined} style={{ width: 150 }} />
          {govTag("v4.2.0")}
        </SystemScope>
      );
    case "patterns":
      return (
        <span className="art-row art-pattern" data-stack={resp}>
          <Field
            inert
            value="ada@studio"
            state="error"
            error={content ? "Enter an email like name@domain.com" : "Invalid"}
            style={{ width: 210 }}
          />
          {a11y && <span className="t-mono t-muted">aria-describedby</span>}
        </span>
      );
    case "product":
      return (
        <SystemScope config={platform ? { platform: "ios" } : {}} className="art-product" data-narrow={resp}>
          <span className="art-product__nav">
            {resp ? (
              <span className="art-menu">
                <Icon name="more" /> Menu
              </span>
            ) : (
              <>
                <span data-current>Account</span>
                <span>Billing</span>
                <span>Team</span>
              </>
            )}
          </span>
          <span className="art-product__body">
            {a11y && <span className="t-mono t-muted">skip to content</span>}
            <Button inert size="sm">
              {content ? "Invite teammate" : "Add"}
            </Button>
            {gov && <span className="stack-gov t-mono">checkout · v4.2</span>}
          </span>
        </SystemScope>
      );
  }
}
