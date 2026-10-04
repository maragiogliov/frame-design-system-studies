"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Scene, useDesktop } from "@/hooks/scene";
import { Flip } from "@/system/gsap";
import { dur } from "@/system/motion";
import { useSystem } from "@/system/SystemProvider";

const ZONES = [
  { id: "system", label: "System decisions", rule: "Shared. Every product inherits the fixes — and the breaking changes." },
  { id: "product", label: "Product decisions", rule: "Owned by one team. Fast to change, invisible to the others." },
  { id: "brand", label: "Brand decisions", rule: "Expression, not infrastructure. Still bound by system contrast and focus rules." },
  { id: "local", label: "Local exceptions", rule: "Documented. Re-argued at every review — then promoted or removed." },
] as const;
type Zone = (typeof ZONES)[number]["id"];

const ITEMS: { id: string; zone: Zone; debate: string }[] = [
  { id: "Focus ring behaviour", zone: "system", debate: "Nobody should be able to remove it locally. That is why it lives here." },
  { id: "Semantic colour tokens", zone: "system", debate: "The meaning is shared; the values are per brand." },
  { id: "Button", zone: "system", debate: "Shared — but checkout wants a 56px variant. Variant or exception?" },
  { id: "Date picker", zone: "product", debate: "Three products built one. Time zones and booking rules differ. Component, or pattern?" },
  { id: "Data table density", zone: "system", debate: "Admin needs 28px rows; Editorial never uses tables. Shared rule, product setting?" },
  { id: "Checkout flow layout", zone: "product", debate: "Revenue-critical, tested weekly. Standardising it would slow the only team that knows it." },
  { id: "Onboarding sequence", zone: "product", debate: "Each product’s first five minutes are its own argument." },
  { id: "Wordmark and display type", zone: "brand", debate: "Brand owns the face; the system owns the scale it sits on." },
  { id: "Campaign illustration", zone: "brand", debate: "Changes every quarter. Making it a system asset would freeze it." },
  { id: "Seasonal theme", zone: "brand", debate: "A theme is just another brand map — if it respects the semantic layer." },
  { id: "Kiosk font size", zone: "local", debate: "One product, one context, 3 metres viewing distance. Rare by design." },
  { id: "Legacy print stylesheet", zone: "local", debate: "Kept because one customer prints invoices. Owner: Billing. Review: v5.0." },
];

export function Boundaries() {
  return (
    <Scene
      id="boundaries"
      label="Decisions sit inside or outside the system: system decisions, product decisions, brand decisions and local exceptions. Each decision can be moved across a boundary; each move has a consequence."
    >
      {() => <BoundariesBody />}
    </Scene>
  );
}

function BoundariesBody() {
  const desktop = useDesktop();
  const { record } = useSystem();
  const root = useRef<HTMLDivElement>(null);
  const [zones, setZones] = useState<Record<string, Zone>>(() => Object.fromEntries(ITEMS.map((i) => [i.id, i.zone])));
  const [last, setLast] = useState<{ id: string; from: Zone; to: Zone } | null>(null);
  const flip = useRef<Flip.FlipState | null>(null);

  useLayoutEffect(() => {
    if (!flip.current) return;
    Flip.from(flip.current, { duration: dur(0.6), ease: "power2.inOut", absolute: false, nested: true });
    flip.current = null;
  }, [zones]);

  const move = (id: string, dir: -1 | 1) => {
    const order = ZONES.map((z) => z.id);
    const from = zones[id];
    const to = order[order.indexOf(from) + dir];
    if (!to) return;
    flip.current = Flip.getState(root.current!.querySelectorAll(".bd-item"));
    setZones({ ...zones, [id]: to });
    setLast({ id, from, to });
    record(`boundary: ${id}`, from, to, "boundaries");
  };

  const count = (z: Zone) => ITEMS.filter((i) => zones[i.id] === z).length;
  const lastItem = last && ITEMS.find((i) => i.id === last.id);
  const lastZone = last && ZONES.find((z) => z.id === last.to);

  return (
    <div className="bd">
      <div className="bd-intro">
        <p className="t-statement">
          The system does not
          <br />
          own every decision.
        </p>
        <p className="t-essay">
          Boundaries are not purity. They move — and every move changes <em>who maintains what, and who is surprised by it.</em>
        </p>
      </div>

      <div ref={root} className="bd-zones">
        {ZONES.map((z, zi) => (
          <section key={z.id} className="bd-zone" data-zone={z.id} aria-label={z.label}>
            <header className="bd-zone__head">
              <span className="bd-zone__label">{z.label}</span>
              <span className="t-mono t-muted">{count(z.id)}</span>
            </header>
            <ul className="bd-list">
              {ITEMS.filter((i) => zones[i.id] === z.id).map((i) => (
                <li key={i.id} className="bd-item" data-flip-id={i.id} data-moved={last?.id === i.id}>
                  <button
                    type="button"
                    className="bd-arrow"
                    disabled={zi === 0}
                    aria-label={`Move ${i.id} toward ${ZONES[zi - 1]?.label ?? "—"}`}
                    onClick={() => move(i.id, -1)}
                  >
                    {desktop ? "←" : "↑"}
                  </button>
                  <span className="bd-item__name">{i.id}</span>
                  <button
                    type="button"
                    className="bd-arrow"
                    disabled={zi === ZONES.length - 1}
                    aria-label={`Move ${i.id} toward ${ZONES[zi + 1]?.label ?? "—"}`}
                    onClick={() => move(i.id, 1)}
                  >
                    {desktop ? "→" : "↓"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="bd-consequence" aria-live="polite">
        {last && lastItem && lastZone ? (
          <>
            <p className="t-label">
              {last.id}: {last.from} → <span className="t-accent">{last.to}</span>
            </p>
            <p className="t-essay">
              <em>{lastZone.rule}</em> {lastItem.debate}
            </p>
          </>
        ) : (
          <>
            <p className="t-label">move any decision across a boundary</p>
            <p className="t-essay">The placement above is one team’s current answer, not the right one.</p>
          </>
        )}
      </div>
    </div>
  );
}
