"use client";

import { SCENES } from "@/presentation/scenes";
import { Presenter } from "@/presentation/Presenter";
import { useActiveScene } from "@/hooks/scene";
import { useSystem } from "@/system/SystemProvider";
import { BASE_CONFIG, BRANDS, PLATFORM_LABEL } from "@/system/tokens";
import { gsap, ScrollTrigger } from "@/system/gsap";
import { reduced } from "@/system/motion";

export function scrollToScene(id: string) {
  window.dispatchEvent(new Event("study:interrupt"));
  const st = ScrollTrigger.getById(`scene-${id}`);
  const y = st ? st.start + 2 : (document.getElementById(id)?.offsetTop ?? 0);
  if (reduced()) window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
  else gsap.to(window, { duration: 1.1, ease: "power2.inOut", scrollTo: { y, autoKill: true } });
  document.getElementById(id)?.focus({ preventScroll: true });
}

export function Chrome() {
  const activeId = useActiveScene();
  const { config } = useSystem();
  const active = SCENES.find((s) => s.id === activeId) ?? SCENES[0];

  const parts: [string, string, boolean][] = [
    ["v", config.version, config.version !== BASE_CONFIG.version],
    ["brand", BRANDS[config.brand].name, config.brand !== BASE_CONFIG.brand],
    ["mode", config.mode, config.mode !== BASE_CONFIG.mode],
    ["density", config.density, config.density !== BASE_CONFIG.density],
    ["platform", PLATFORM_LABEL[config.platform], config.platform !== BASE_CONFIG.platform],
  ];
  if (config.contrast === "high") parts.push(["", "high contrast", true]);
  if (config.motion === "reduced") parts.push(["", "reduced motion", true]);

  return (
    <>
      <a className="skip" href="#definition">
        Skip the introduction
      </a>
      <div className="chrome-top">
        <a className="chrome-mark" href="#intro" onClick={(e) => (e.preventDefault(), scrollToScene("intro"))}>
          Design systems <span>— a study</span>
        </a>
      </div>

      <nav className="rail" aria-label="Scenes">
        {SCENES.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={s.id === activeId ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              scrollToScene(s.id);
            }}
          >
            <span className="t-num">{s.index}</span>
            <span className="rail__title">{s.title}</span>
          </a>
        ))}
      </nav>

      <p className="readout" aria-live="off">
        System{" "}
        {parts.map(([k, val, changed], i) => (
          <span key={k + i} className={changed ? "is-changed" : undefined}>
            {i > 0 && " · "}
            {k === "v" ? <b>v{val}</b> : val}
          </span>
        ))}
      </p>

      <p className="mobile-bar" aria-hidden="true">
        <span className="t-accent">{active.index}</span> {active.title} · v{config.version}
      </p>

      <Presenter />
    </>
  );
}
