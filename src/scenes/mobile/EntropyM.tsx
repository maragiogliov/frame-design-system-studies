"use client";

import { AUDIT, INSTANCES, propsAt, SOURCE, styleOf, TEAMS, TICKS, tokenStyle } from "../Entropy";

export function EntropyM({ step }: { step: number }) {
  const governed = step >= 8;
  const audit = step === 7;
  const tick = Math.min(step, 6);
  const visible = INSTANCES.filter((i) => step > 0 && i.born <= Math.max(1, tick));
  const latest = INSTANCES.flatMap((i) => i.changes.filter((c) => c.at === tick && step >= 2 && step <= 6).map((c) => ({ ...c, team: TEAMS[i.team] }))).slice(0, 2);

  return (
    <div className="m ment">
      <div className="m-top">
        <span className="m-label">{TICKS[step]}</span>
        {!audit && !governed && (
          <p className="m-cap">
            {step === 0 && "One shared button."}
            {step === 1 && "Six teams copy it. For now, the copies are identical."}
            {latest.length > 0 &&
              latest.map((l) => (
                <span key={l.team + l.note} className="ment-note">
                  <em>{l.team}:</em> {l.note}
                </span>
              ))}
          </p>
        )}
        {audit && (
          <p className="m-title">
            Without governance, <span className="t-accent">systems drift.</span>
          </p>
        )}
        {governed && (
          <p className="m-cap">
            {step === 8 ? (
              <>
                Shared tokens arrive. <em>The drift reverses.</em>
              </>
            ) : (
              <>
                <em>1 component, 2 variants, 1 documented exception.</em> Not sameness.
              </>
            )}
          </p>
        )}
      </div>

      <div className="m-focus is-top">
        {!audit ? (
          <>
            <div className="ment-source">
              <span className="ent-btn" style={governed ? tokenStyle("default") : styleOf(SOURCE)}>
                Continue
              </span>
              <span className="m-label">{governed ? "Button · tokens" : step === 0 ? "Button · shared" : "Button · copied"}</span>
            </div>
            {step >= 1 && (
              <ul className="ment-teams">
                {TEAMS.map((team, t) => {
                  const lane = visible.filter((i) => i.team === t);
                  const first = lane[0];
                  if (!first) return null;
                  const p = propsAt(first, tick);
                  return (
                    <li key={team} data-drift={!governed && step >= 4}>
                      <span className="m-label">{team}</span>
                      <span className="ent-btn" style={governed ? tokenStyle(first.governed) : styleOf(p)}>
                        {first.label}
                      </span>
                      {lane.length > 1 && <span className="m-read t-muted">+{lane.length - 1}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <dl className="ment-audit">
            {(
              [
                [AUDIT.buttons, "buttons"],
                [AUDIT.colors.length, "action colours"],
                [AUDIT.radii.length, "radii"],
                [AUDIT.shadows.length, "shadows"],
                [AUDIT.focus.length, "focus behaviours"],
              ] as [number, string][]
            ).map(([n, l]) => (
              <div key={l}>
                <dt className="m-big">{n}</dt>
                <dd className="m-label">{l}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="m-foot">
        <p className="m-read">
          {governed ? (
            <>
              <span className="t-muted">17 buttons →</span> 1 component <span className="t-muted">· 12 colours →</span> 1
            </>
          ) : (
            <>
              <span className="t-muted">copies</span> {visible.length}{" "}
              <span className="t-muted">· connections to source</span> {step >= 4 ? "broken" : step >= 2 ? "weakening" : "intact"}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
