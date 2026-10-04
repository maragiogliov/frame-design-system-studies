"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Scene, useDesktop } from "@/hooks/scene";
import { Button, Field, Icon, Nav, Table, TOK } from "@/ui/kit";

const LEVELS = [
  { name: "surface + text + icon + border + space", short: "Primitives" },
  { name: "Button", short: "Button" },
  { name: "Toolbar", short: "Toolbar" },
  { name: "Application header", short: "Header" },
  { name: "Product interface", short: "Interface" },
];

export function Composition() {
  return (
    <Scene
      id="composition"
      label="Five primitives compose into a button. The button is reused inside a toolbar, the toolbar inside an application header, and the header inside a product interface. Hovering any button highlights every instance."
    >
      {({ step }) => <CompositionStage step={step} />}
    </Scene>
  );
}

function CompositionStage({ step }: { step: number }) {
  const desktop = useDesktop();
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(1);
  const vis = (lvl: number) => ({ "data-lvl": lvl, "data-vis": step >= lvl });

  useLayoutEffect(() => {
    const all = root.current?.querySelectorAll<HTMLElement>('[data-comp="button"]') ?? [];
    setCount(Array.from(all).filter((b) => (b.closest("[data-lvl]") as HTMLElement | null)?.dataset.vis !== "false").length);
  }, [step, desktop]);

  return (
    <div className="cmp">
      <ol className="cmp-ladder">
        {LEVELS.map((l, i) => (
          <li key={l.short} data-state={i === step ? "now" : i < step ? "past" : "next"}>
            <span className="t-mono t-muted">{i === 0 ? "" : "→"}</span>
            <span className="cmp-ladder__name">{l.name}</span>
          </li>
        ))}
        <li className="cmp-count">
          <span className="t-label">Button instances</span>
          <span className="cmp-count__n t-num">{step === 0 ? "0" : count}</span>
          <span className="t-label">one definition</span>
        </li>
      </ol>

      <div ref={root} className="cmp-app" data-step={step}>
        <div className="cmp-frame" data-label="product interface" data-on={step >= 4} data-chrome={step >= 4}>
          <div className="cmp-header-wrap" data-label="application header" data-on={step === 3}>
            <header className="cmp-header" data-chrome={step >= 3} data-token="space.400 color.border.subtle">
              <span className="cmp-wordmark" {...vis(3)}>
                Ledger
              </span>
              {desktop && (
                <span {...vis(3)} className="cmp-nav">
                  <Nav items={["Overview", "Invoices", "Clients"]} current={1} />
                </span>
              )}
              <span className="cmp-toolbar-wrap" data-label="toolbar" data-on={step === 2}>
                <span className="cmp-toolbar" data-token="space.200">
                  <span className="cmp-btn-wrap" data-label="button" data-on={step === 1} data-lvl={0} data-vis="true">
                    <Exploded exploded={step === 0} />
                  </span>
                  <span {...vis(2)} className="cmp-inline">
                    <Button inert intent="secondary" data-comp="button" data-k="preview">
                      Preview
                    </Button>
                    <Button inert intent="ghost" icon="more" data-comp="button" />
                  </span>
                </span>
              </span>
              <span className="cmp-avatar" {...vis(3)} aria-hidden="true">
                AL
              </span>
            </header>
          </div>

          <div className="cmp-body" {...vis(4)}>
            {desktop && (
              <aside className="cmp-side" data-token="space.300">
                {[
                  ["All invoices", "12"],
                  ["Drafts", "3"],
                  ["Sent", "6"],
                  ["Paid", "3"],
                ].map(([l, n], i) => (
                  <span key={l} className="cmp-side__item" data-current={i === 0 || undefined}>
                    {l} <span className="t-muted t-num">{n}</span>
                  </span>
                ))}
                <Button inert size="sm" icon="plus" data-comp="button">
                  New invoice
                </Button>
              </aside>
            )}
            <main className="cmp-main">
              <span className="cmp-main__title">Invoices</span>
              <span className="cmp-filter">
                <Field inert icon="search" placeholder="Search clients" style={{ flex: 1 }} />
                <Button inert intent="secondary" icon="filter" data-comp="button">
                  Filter
                </Button>
              </span>
              <Table
                rows={[
                  ["INV-2039", "Draft", "€320.00"],
                  ["INV-2040", "Sent", "€1,240.00"],
                  ["INV-2041", "Paid", "€88.50"],
                ]}
                selected={1}
              />
              <span className="cmp-pager">
                <Button inert size="sm" intent="secondary" data-comp="button">
                  Previous
                </Button>
                <Button inert size="sm" intent="secondary" data-comp="button">
                  Next
                </Button>
              </span>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The button, with its primitives pulled apart when `exploded`. */
function Exploded({ exploded }: { exploded: boolean }) {
  return (
    <span className="xbtn" data-exploded={exploded} data-comp="button" data-token={TOK.buttonPrimary} aria-hidden="true">
      <span className="xbtn__layer xbtn__surface" data-name="surface · color.action.primary" />
      <span className="xbtn__layer xbtn__border" data-name="border · radius.control" />
      <span className="xbtn__layer xbtn__space" data-name="space · space.inset.control" />
      <span className="xbtn__content">
        <span className="xbtn__layer xbtn__icon" data-name="icon · size.icon.md">
          <Icon name="arrow" />
        </span>
        <span className="xbtn__layer xbtn__text" data-name="text · type.label.md">
          Publish
        </span>
      </span>
    </span>
  );
}
