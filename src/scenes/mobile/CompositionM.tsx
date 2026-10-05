"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button, Icon } from "@/ui/kit";
import { Exploded } from "../Composition";

const LEVELS = ["Primitives", "Button", "Toolbar", "Header", "Interface"];

export function CompositionM({ step }: { step: number }) {
  const v = (lvl: number) => ({ "data-lvl": lvl, "data-vis": step >= lvl });
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  useLayoutEffect(() => {
    const all = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-comp="button"]') ?? []);
    setCount(step === 0 ? 0 : all.filter((b) => (b.closest("[data-lvl]") as HTMLElement | null)?.dataset.vis !== "false").length);
  }, [step]);
  return (
    <div className="m mc">
      <div className="m-top">
        <p className="m-read mc-ladder">
          {LEVELS.map((l, i) => (
            <span key={l} data-state={i === step ? "now" : i < step ? "past" : "next"}>
              {i > 0 && " → "}
              {l}
            </span>
          ))}
        </p>
        <p className="m-cap">
          <span className="m-big">{count}</span> Button instances · <em>one definition</em>
        </p>
      </div>

      <div className="m-focus is-top" ref={root}>
        <div className="mc-app" data-chrome={step >= 4}>
          <div className="mc-head" data-chrome={step >= 3} data-label="header" data-on={step === 3}>
            <span className="cmp-wordmark" {...v(3)}>
              Ledger
            </span>
            <span className="mc-toolbar" data-label="toolbar" data-on={step === 2}>
              <span className="mc-btn" data-label="button" data-on={step === 1} data-lvl={0} data-vis="true">
                <Exploded exploded={step === 0} />
              </span>
              <span {...v(2)}>
                <Button inert intent="ghost" icon="more" data-comp="button" />
              </span>
            </span>
          </div>
          <div className="mc-body" {...v(4)}>
            <span className="cmp-main__title">Invoices</span>
            {[
              ["INV-2039", "Draft", "€320.00"],
              ["INV-2040", "Sent", "€1,240.00"],
              ["INV-2041", "Paid", "€88.50"],
            ].map(([id, st, amt]) => (
              <span key={id} className="mc-row">
                <span className="t-mono-ui">{id}</span>
                <span className="t-muted">{st}</span>
                <span className="t-num">{amt}</span>
              </span>
            ))}
            <Button inert intent="secondary" icon="plus" data-comp="button">
              New invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="m-foot">
        <p className="m-read">
          <Icon name="arrow" size={12} /> <span className="t-muted">change Button once — every level above it changes</span>
        </p>
      </div>
    </div>
  );
}
