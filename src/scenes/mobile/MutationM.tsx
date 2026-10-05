"use client";

import { SystemScope } from "@/system/SystemProvider";
import { BRANDS } from "@/system/tokens";
import { Button, Toggle } from "@/ui/kit";
import { VERSIONS } from "../Mutation";

export function MutationM({ step }: { step: number }) {
  const ver = VERSIONS[step];
  return (
    <div className="m mmut">
      <div className="m-top">
        <p className="m-title is-xl" aria-live="polite">
          v{ver.v}
        </p>
        <p className="m-title is-sm">{ver.title}</p>
      </div>

      <div className="m-focus is-top">
        <ul className="mmut-log">
          {ver.log.slice(0, 3).map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <div className="mmut-outs">
          {ver.outputs.map((o) => (
            <SystemScope key={o.label} config={{ ...ver.override, ...o.config }} className="mmut-out scope-surface">
              <span className="m-label">{o.config.brand ? BRANDS[o.config.brand].name : o.label}</span>
              <Button inert size="sm">
                Publish
              </Button>
              <Button inert size="sm" intent="secondary" state="focus">
                Focus
              </Button>
              <Toggle inert label="" checked />
            </SystemScope>
          ))}
        </div>
      </div>

      <div className="m-foot">
        <p className="m-cap">
          {step < 4 ? (
            <>
              The whole page is running <em>v{ver.v}</em> right now — look at the edges.
            </>
          ) : (
            <>
              You were reading v4.0 all along. <em>The system remembers.</em>
            </>
          )}
        </p>
        <div className="m-steps" aria-hidden="true">
          {VERSIONS.map((x, i) => (
            <span key={x.v} data-on={i < step} data-now={i === step} />
          ))}
        </div>
      </div>
    </div>
  );
}
