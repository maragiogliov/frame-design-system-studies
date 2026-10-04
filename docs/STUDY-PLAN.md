# Design Systems — a study

Pre-implementation definition. Everything below is implemented in `src/`.

---

## 1. Visual identity

An exhibition catalogue, not a product. Paper and ink, hairline structure, one signal colour.

- **Ground**: warm paper (`paper.50 #F3F1EA`) / near-black ink (`ink.950 #121110`) in dark mode.
- **Structure**: 1px hairlines are the main graphic material. Lines are *relationships*: every line on the page connects a cause to a consequence. No decorative rules.
- **Signal**: one action colour, `color.action.primary`. On the default brand it resolves to vermilion (`#C8370F` light / `#F0603A` dark). It is the colour that propagates, so it is used sparingly everywhere else.
- **Corners**: `radius.control = 2px`, `radius.container = 0`. Sharp, architectural. Larger radii only appear when a *platform* or *brand* demands them (iOS 10px, Android full), so roundness itself becomes evidence of a token decision.
- **Layout**: asymmetric 12-column field, content pushed left or right of centre, annotations in the margins. Things are allowed to leave their columns when a line needs to connect them.
- **No** gradients, glows, glass, blobs, cards-in-grids, fake browsers, fake phones, fake stats.

## 2. Typography system

Three families, three jobs:

| Role | Family | Use |
|---|---|---|
| `font.display` | **Archivo** (variable, `wdth` 62–125) | Statements, section indices, UI. The width axis is itself a token (`type.display.width`) and mutates with brand/version. |
| `font.text` | **Newsreader** | Essay voice: definitions, captions, the arguments between scenes. |
| `font.mono` | **JetBrains Mono** | Token names, values, versions, counts. Anything the machine reads. |

Scale is generated, not chosen: `type.heading.* = type.body.md × ratio^n`. Ratio is a token (`type.scale`, default 1.25).

## 3. Token architecture used by the page itself

The page is a consumer of its own system. Source of truth: `src/system/tokens.ts`.

```
SystemConfig (mode, contrast, motion, density, brand, platform, radius, spaceBase, typeScale, focus, targetMin)
   │
   ├─ primitives   (raw values, never referenced by components)
   ├─ semantic     (meaning; resolved per mode / contrast / brand)
   └─ component    (aliases of semantic tokens, per component)
          │
          ▼
   CSS custom properties on <html> (global) or on a scope element (local)
```

Config layers resolve in order: `base (v4.0)` ← `user (lab / accessibility toggles)` ← `scene override (Mutation scene)`. A scope element (`<SystemScope>`) can re-resolve a subtree, which is how demos get their own system without leaving the page’s.

## 4. Token examples

**Primitive**: `ink.950 ink.900 ink.500 ink.300 paper.50 paper.0 vermilion.600 vermilion.400 moss.600 moss.300 ochre.500 ochre.800 yellow.300 red.600 grid.4`

**Semantic**: `color.text.primary color.text.secondary color.text.onAction color.surface.default color.surface.raised color.surface.sunken color.border.subtle color.border.strong color.action.primary color.action.primaryHover color.action.text color.action.subtle color.feedback.error color.focus.ring space.100…space.1600 radius.control radius.container size.control.height size.target.min size.icon.md type.body.md type.heading.lg motion.duration.base`

**Component**: `button.primary.background → color.action.primary`, `button.primary.text → color.text.onAction`, `button.height → size.control.height`, `button.radius → radius.control`, `input.background → color.surface.raised`, `input.border → color.border.strong`, `nav.indicator → color.action.primary`, `toggle.track.on → color.action.primary`.

Brand C (ochre) is deliberately included because its brand colour **fails** as text on paper (2.3:1). The semantic layer absorbs it: `color.action.text` resolves to `ochre.800` while `color.action.primary` stays `ochre.500`, and `color.text.onAction` flips to ink. That is the argument for semantics, shown rather than said.

## 5. Dependency model

`src/system/graph.ts` holds one graph of 46 nodes in six columns:
`primitives → modes & platforms → semantic tokens → components → patterns → products`.
Edges mean *“changes here require attention there.”* “This study” is one of the products: the page depends on the system it describes. The Network scene, the Breaking-change calculator and the Finale all read this same graph. Counts shown on screen (consumers, touch points, affected products) are computed from it or from the live DOM (`[data-token~="…"]`), never typed by hand.

## 6. Main interactive components

Real, token-driven, accessible UI primitives in `src/ui`: Button, IconButton, Input, Checkbox, Toggle (switch), Tag, Tooltip, MenuItem, Nav, Dialog, TableRow, DatePicker, Toast. Every element that consumes a token declares it: `data-token="color.action.primary radius.control"`. Propagation, hover-to-reveal and counting all use that attribute.

Interactive controls (all native buttons / radios / ranges / switches):
- Tokens: mode switch + architecture switch (3-layer vs 2-layer).
- Propagation: `color.action.primary`, `radius.control`, `space.base`.
- Spacing: base rhythm 2 / 4 / 6 / 8.
- States: live button after the sequence.
- Themes: four typographic axis rails.
- Accessibility: high contrast, reduced motion, larger targets — global.
- Boundaries: move decisions between zones.
- Network: select a node; apply one of four breaking changes.
- Lab: every axis, scoped to the specimen or to the whole study.

## 7. Key system mutations

1. Intro: one radius change runs through nine unrelated elements.
2. Tokens: light → dark re-routes semantic→primitive edges; component edges never move.
3. Propagation: action colour / radius / space base pulse through ~40 consumers.
4. Mutation over time: the *whole page* passes through v1.0 → v1.4 → v2.0 → v3.0 → v4.0. The v4.0 you have been reading is the end state.
5. Accessibility toggles re-resolve the entire page.
6. Lab: the visitor can push any decision into the whole study.

## 8. Entropy sequence

Six teams (Checkout, Search, Onboarding, Admin, Mobile, Marketing) fork one shared `Button`. Seven ticks of time. Each tick applies concrete local edits (radius +2, padding +4, “closer to the brand deck” red, icon 16→18, disabled .4→.3, focus ring removed, shadow added, local large variant…). Forks multiply. Connections to the shared source stretch, dash, then break. An audit counts the result from the data: **17 buttons · 12 action colours · 8 radii · 6 shadows · 4 focus behaviours**. Then governance: tokens are introduced; each inventory row collapses to one value; instances return to their lanes and re-attach to the source. The result is not perfect: 1 component, 2 sanctioned variants (`size=lg`, `intent=secondary`), 1 documented local exception. The forked instances use hard-coded hex values, so in dark mode they visibly fail to adapt — detachment from tokens is shown, not stated.

## 9. Governance sequence

Bottom-up first (contribution), then the lifecycle:
`local need → local component → pattern repeats (3 teams) → proposal` (with a one-off countdown button that stays local), then the proposal object travels `system review → accessibility → engineering → release → adoption`. Each stage visibly mutates the component: props trimmed, focus + accessible name added, hard-coded colours replaced by tokens, a version and changelog line attached, then three local copies replaced.

## 10. Deprecation / migration sequence

`Button / Legacy` is marked deprecated in v3.2 with 8 consumers. An adapter appears (prop mapping). Consumers move in batches over releases (v3.4, v3.6, v4.0, v4.3). Two stragglers stall for real reasons (custom theme; no owning team). The adapter carries them until v5.0, when the legacy node and the adapter are removed. Each consumer’s button visibly changes appearance at the moment it migrates.

## 11. Accessibility modes

Global, real toggles:
- **High contrast** — semantic colour tokens resolve to a separate map; focus ring 2px → 3px; secondary text promoted.
- **Reduced motion** — `motion.duration.*` resolve to 0; GSAP pulses become cuts; presentation travel becomes jumps.
- **Larger targets** — `size.target.min` 24 → 44; hit areas expand everywhere.
The scene lists every affected token with live contrast ratios computed from the resolver.

## 12. Responsive strategy

Scenes are recomposed, not shrunk. Breakpoint at 64rem (`useDesktop()`, a `matchMedia` hook) switches *structure*, not just sizes:
- Spatial maps become lists: Definition’s four columns become labelled rows with “needs / feeds” text; the Network becomes a native `<select>` plus downstream waves as text.
- Horizontal flows become vertical: governance track collapses to the current stage, deprecation consumers become a two-column grid, stack forces become a narrow strip.
- Fewer simultaneous dependencies: Intro shows 6 elements instead of 9, Propagation 4 fragments instead of 7, Stack shows a live artifact only on the product row.
- No wires on phones where they would cross text; pulses carry propagation instead.

Layout changes are React state, not animation state, so they use `matchMedia` directly rather than `gsap.matchMedia()`; no timeline needs a per-breakpoint variant because scenes are stepped (see 15).

## 13. GSAP motion language

Motion only for: **propagation** (pulse travelling by distance from the cause), **inheritance** (re-routing edges), **composition** (Flip: parts collapse into a whole), **divergence** (forks drift from their source), **consolidation** (drift reverses), **mutation** (discrete re-resolution, one axis at a time), **migration** (edges re-attach), **dependency** (lines drawn from cause to consequence).
Easing: `power2.inOut` for structural moves, `power3.out` for arrivals, `none` for scrubbed lines. No bounce, no elastic, no stagger without a dependency explaining the order.

## 14. Pinned scenes (CSS sticky stage, ScrollTrigger progress)

Pinned (18): Opening, Definition, Stack, Tokens, Propagation, Spacing, Composition, States, Variants, Entropy, Themes, Mutation, Deprecation, Governance, Accessibility, Scale, Network, Finale.

Still (3): Consistency ≠ sameness, Boundaries, Laboratory. These are places to stop and use the system, not watch it.

Pinning is a `position: sticky` stage inside a section of `(length + 1) × 100svh`; ScrollTrigger only reads progress. No pin-spacers, so React can re-render stage content freely.

## 15. Scrubbed vs stepped

Every scene is **stepped**: scroll progress → discrete system state → transition, with transition durations read from `motion.duration.*`. Lines draw on state change (CSS `stroke-dashoffset` on measured paths), not on continuous scrub.

Decision: continuous scrubbing was dropped during implementation because (a) presentation holds land on stable states rather than mid-interpolation frames, (b) reduced motion becomes a single token change instead of a second code path, and (c) the user can interact with a state (select a node, change a token) without scroll fighting them. `useStepOverride` lets a user choice hold until the next scroll step.

## 16. Presentation scene map

`src/presentation/scenes.ts`: 21 scenes (00–20), each `{ id, index, title, target, travelDuration, hold, stops[] }`, 120 stops in total. Pinned scenes get one stop at the centre of each step; still scenes get a top stop (and Sameness a bottom stop). Holds are longer on the statements: *Nothing here is independent* (3.4 s), *A component is not a picture* (4 s), *Without governance, systems drift* (4.2 s), *Consistency ≠ sameness* (4 s), *Scale does not remove complexity* (4 s), the finale (3.6–4 s).

Merged during implementation: Contribution → Governance (one pipeline, entered bottom-up); Breaking changes → Network (a change is a selection on the dependency graph).

## 17. Approximate duration

≈ 8 min 50 s at default speed: travel ≈ 4 min 13 s, holds ≈ 4 min 36 s.

## 18. Reduced-motion behaviour

`prefers-reduced-motion` or the in-page toggle:
- Every transition duration resolves to 0 (token-level, so CSS and GSAP agree).
- Stepped scenes still advance — as cuts.
- Lines appear whole at their step instead of drawing.
- Presentation jumps between stops and holds 40% longer.
- No pulse travel; affected elements get a static outline instead.

## 19. Authorship

Two places only, both typographic and quiet:
- Intro, after the title resolves: `A study by Victor Maragioglio` with `victormaragioglio.com` as a plain link.
- Finale, after the conclusion, in the same voice, beside `Replay study`.
The fixed header carries only the study title. No portrait, no CTA, no contact prompt.
