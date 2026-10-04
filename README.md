# Design Systems — a study

An interactive visual essay on how design systems encode decisions, propagate change, drift, get governed and evolve. The page is built as a design system and consumes its own tokens.

A study by [Victor Maragioglio](https://victormaragioglio.com).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build; the page prerenders as static
```

## Where things live

| Path | What it is |
| --- | --- |
| `docs/STUDY-PLAN.md` | The pre-implementation definition: identity, type, tokens, dependency model, motion language, scene map, reduced motion, authorship. |
| `src/system/tokens.ts` | Token architecture: config → primitives → semantic → component → CSS custom properties. Contrast maths. |
| `src/system/SystemProvider.tsx` | Config layers (`base ← user ← scene override ← accessibility`), writes tokens onto `<html>`, `SystemScope` for re-resolved subtrees, decision log. |
| `src/system/graph.ts` | The dependency graph used by Network, breaking-change impact and Finale. |
| `src/presentation/scenes.ts` | Scene + presentation metadata (`presentationScenes`). |
| `src/presentation/Presenter.tsx` | Autoplay: moves document scroll with ScrollToPlugin, holds, pauses on any user input. |
| `src/hooks/scene.tsx` | `Scene`: sticky stage + ScrollTrigger progress → discrete step. |
| `src/hooks/wires.tsx` | Connectors measured from real layout. |
| `src/ui/kit.tsx` | Token-driven UI kit; every element declares its tokens in `data-token`. |
| `src/scenes/*` | The 21 scenes. |

## Presentation keys

`▶ Present` (bottom right) starts the self-running study. While presenting: **Space** play/pause · **→/↓** next scene · **←/↑** previous scene · **Esc** exit. Wheel, touch, PageUp/Down/Home/End or dragging the scrollbar pauses it; it never resumes on its own.
# frame-design-system-studies
