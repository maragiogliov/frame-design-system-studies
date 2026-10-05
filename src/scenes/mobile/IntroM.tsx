"use client";

import { useEffect, useRef } from "react";
import { SystemScope } from "@/system/SystemProvider";
import { consumers, pulse } from "@/system/pulse";
import { Button, Field, Menu, Tag, Toggle } from "@/ui/kit";

const ROWS: { id: string; uses: ("action" | "radius")[] }[] = [
  { id: "button", uses: ["action", "radius"] },
  { id: "input", uses: ["radius"] },
  { id: "toggle", uses: ["action"] },
  { id: "tag", uses: ["action", "radius"] },
  { id: "menu", uses: ["action", "radius"] },
];

function El({ id }: { id: string }) {
  switch (id) {
    case "button":
      return (
        <Button inert icon="check">
          Save draft
        </Button>
      );
    case "input":
      return <Field inert value="ada@studio.io" style={{ width: "100%" }} />;
    case "toggle":
      return <Toggle inert label="Sync" checked />;
    case "tag":
      return <Tag>Beta</Tag>;
    default:
      return <Menu items={[["Duplicate", "⌘D"]]} active={0} />;
  }
}

/**
 * Phones: the elements become a column; the shared tokens become two
 * vertical buses with a dot wherever an element consumes them.
 */
export function IntroM({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  const bus = { action: step >= 1 && step < 4, radius: step >= 2 && step < 4 };

  useEffect(() => {
    if (step === 3) pulse(consumers(root.current, "radius.control"), root.current?.querySelector(".mi-head [data-bus='radius']"));
  }, [step]);

  return (
    <div className="m mi">
      <div className="m-top">
        {step <= 2 && (
          <p className="m-cap">
            {step === 0 && "Five interface elements. Apparently unrelated."}
            {step === 1 && (
              <>
                Four of them read the same decision: <em>color.action.primary</em>.
              </>
            )}
            {step === 2 && (
              <>
                Four read <em>radius.control</em>. Some read both.
              </>
            )}
          </p>
        )}
        {step === 3 && <p className="m-title">Nothing here is independent.</p>}
        {step === 4 && (
          <p className="m-title is-xl" aria-hidden="true">
            Design
            <br />
            systems
          </p>
        )}
      </div>

      <SystemScope config={{ radius: step === 3 ? 8 : undefined }} className="m-focus is-top">
        <div ref={root} className="mi-grid dim" data-dim={step === 4 ? "strong" : false}>
          <div className="mi-head" aria-hidden="true">
            <span data-bus="action" data-on={bus.action}>
              action
            </span>
            <span data-bus="radius" data-on={bus.radius}>
              radius {step === 3 ? "8" : "2"}
            </span>
          </div>
          {ROWS.map((r) => (
            <div key={r.id} className="mi-row">
              <span className="mi-bus" data-on={bus.action} data-hit={r.uses.includes("action")} />
              <span className="mi-bus" data-on={bus.radius} data-hit={r.uses.includes("radius")} />
              <span className="mi-el">
                <El id={r.id} />
              </span>
            </div>
          ))}
        </div>
      </SystemScope>

      <div className="m-foot">
        {step < 4 ? (
          <p className="m-read">
            <span className="t-muted">scroll — or press</span> ▶ Present
          </p>
        ) : (
          <>
            <p className="m-cap">How shared decisions create consistency, propagate change, drift, get governed — and evolve.</p>
            <p className="m-label">
              A study by{" "}
              <a href="https://victormaragioglio.com" className="intro-author__link">
                Victor Maragioglio
              </a>{" "}
              ·{" "}
              <a href="https://victormaragioglio.com" className="intro-author__link">
                victormaragioglio.com
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
