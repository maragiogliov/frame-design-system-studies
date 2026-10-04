/**
 * Presentation metadata.
 *
 * Pinned scenes are state machines whose input is scroll progress:
 * `steps` discrete states over `length` viewport-heights of scroll.
 * The presenter never animates the scenes — it only moves the document's
 * scroll position (ScrollToPlugin) to each stop, then holds.
 * Manual scrolling and autoplay therefore reveal the exact same choreography.
 */

export interface Stop {
  /** progress inside the scene's ScrollTrigger range, 0–1 */
  at: number;
  /** seconds to travel here from the previous stop */
  travel: number;
  /** seconds to stay */
  hold: number;
  /** read aloud by the presenter's live region */
  caption?: string;
}

export interface SceneMeta {
  id: string;
  index: string;
  title: string;
  /** discrete states (pinned scenes) — 1 for still scenes */
  steps: number;
  /** scroll length in viewport heights (pinned scenes) */
  length: number;
  pinned: boolean;
  travelDuration: number;
  hold: number;
  /** per-step hold overrides (seconds) */
  holds?: Record<number, number>;
  /** per-step travel override */
  stepTravel?: number;
  captions?: Record<number, string>;
  /** non-pinned scenes taller than the viewport: extra stops */
  extraStops?: Stop[];
}

export const SCENES: SceneMeta[] = [
  {
    id: "intro",
    index: "00",
    title: "Opening",
    steps: 5,
    length: 3,
    pinned: true,
    travelDuration: 1.2,
    hold: 2.4,
    stepTravel: 2.6,
    holds: { 0: 2.8, 3: 3.4, 4: 3.6 },
    captions: { 3: "Nothing here is independent.", 4: "Design systems. A study by Victor Maragioglio." },
  },
  {
    id: "definition",
    index: "01",
    title: "What is a design system",
    steps: 4,
    length: 2.6,
    pinned: true,
    travelDuration: 3,
    hold: 2.2,
    stepTravel: 2.4,
    holds: { 2: 3.2, 3: 3.4 },
    captions: { 0: "A design system is a collection of components.", 3: "A component library is part of the system. It is not the system." },
  },
  {
    id: "stack",
    index: "02",
    title: "System stack",
    steps: 7,
    length: 4.2,
    pinned: true,
    travelDuration: 3,
    hold: 2,
    stepTravel: 2,
    holds: { 0: 3, 6: 3 },
  },
  {
    id: "tokens",
    index: "03",
    title: "Design tokens",
    steps: 5,
    length: 3.4,
    pinned: true,
    travelDuration: 3,
    hold: 2.4,
    stepTravel: 2.2,
    holds: { 3: 3.2, 4: 3.6 },
    captions: { 3: "Dark mode. Semantic edges re-route; component edges do not move.", 4: "Without a semantic layer, the theme breaks." },
  },
  {
    id: "propagation",
    index: "04",
    title: "Propagation",
    steps: 5,
    length: 3.4,
    pinned: true,
    travelDuration: 3,
    hold: 2.4,
    stepTravel: 2,
    holds: { 2: 3, 3: 3 },
    captions: { 1: "One decision. Many consequences." },
  },
  {
    id: "spacing",
    index: "05",
    title: "Spacing system",
    steps: 4,
    length: 2.6,
    pinned: true,
    travelDuration: 3,
    hold: 2.4,
    stepTravel: 2,
  },
  {
    id: "composition",
    index: "06",
    title: "Primitive to product",
    steps: 5,
    length: 3.2,
    pinned: true,
    travelDuration: 3,
    hold: 2,
    stepTravel: 2.2,
    holds: { 4: 3 },
  },
  {
    id: "states",
    index: "07",
    title: "Components are state machines",
    steps: 16,
    length: 6.4,
    pinned: true,
    travelDuration: 3,
    hold: 1.2,
    stepTravel: 1.1,
    holds: { 15: 4 },
    captions: { 15: "A component is not a picture. It is a state machine." },
  },
  {
    id: "variants",
    index: "08",
    title: "Variants",
    steps: 8,
    length: 4.4,
    pinned: true,
    travelDuration: 3,
    hold: 1.6,
    stepTravel: 1.6,
    holds: { 5: 2.6, 7: 3.4 },
    captions: { 7: "Rules create range." },
  },
  {
    id: "entropy",
    index: "09",
    title: "Entropy",
    steps: 10,
    length: 6,
    pinned: true,
    travelDuration: 3,
    hold: 1.8,
    stepTravel: 2.2,
    holds: { 0: 2.4, 7: 4.2, 9: 3 },
    captions: { 7: "Without governance, systems drift." },
  },
  {
    id: "sameness",
    index: "10",
    title: "Consistency ≠ sameness",
    steps: 1,
    length: 0,
    pinned: false,
    travelDuration: 3.4,
    hold: 3.4,
    extraStops: [{ at: 1, travel: 4, hold: 4, caption: "Consistency is not sameness." }],
  },
  {
    id: "themes",
    index: "11",
    title: "Themes and modes",
    steps: 8,
    length: 4.2,
    pinned: true,
    travelDuration: 3,
    hold: 1.6,
    stepTravel: 1.6,
    holds: { 7: 2.8 },
  },
  {
    id: "mutation",
    index: "12",
    title: "Mutation over time",
    steps: 5,
    length: 4,
    pinned: true,
    travelDuration: 3,
    hold: 2.8,
    stepTravel: 2.6,
    holds: { 4: 3.6 },
    captions: { 4: "The system remembers." },
  },
  {
    id: "deprecation",
    index: "13",
    title: "Deprecation",
    steps: 7,
    length: 4,
    pinned: true,
    travelDuration: 3,
    hold: 1.8,
    stepTravel: 2,
    holds: { 6: 3.4 },
    captions: { 6: "Systems cannot change instantly." },
  },
  {
    id: "governance",
    index: "14",
    title: "Governance and contribution",
    steps: 9,
    length: 5,
    pinned: true,
    travelDuration: 3,
    hold: 1.8,
    stepTravel: 1.8,
    holds: { 3: 2.6, 8: 3 },
  },
  {
    id: "accessibility",
    index: "15",
    title: "Accessibility as system logic",
    steps: 4,
    length: 3,
    pinned: true,
    travelDuration: 3,
    hold: 2.6,
    stepTravel: 2,
  },
  {
    id: "scale",
    index: "16",
    title: "Scale",
    steps: 5,
    length: 3.4,
    pinned: true,
    travelDuration: 3,
    hold: 2,
    stepTravel: 2.2,
    holds: { 3: 2.8, 4: 4 },
    captions: { 4: "Scale does not remove complexity. It organizes it." },
  },
  {
    id: "boundaries",
    index: "17",
    title: "System boundaries",
    steps: 1,
    length: 0,
    pinned: false,
    travelDuration: 3,
    hold: 4,
  },
  {
    id: "network",
    index: "18",
    title: "The network",
    steps: 5,
    length: 3.6,
    pinned: true,
    travelDuration: 3,
    hold: 2.6,
    stepTravel: 2,
    holds: { 2: 3.4, 3: 3.4 },
  },
  {
    id: "lab",
    index: "19",
    title: "Laboratory",
    steps: 1,
    length: 0,
    pinned: false,
    travelDuration: 3,
    hold: 4,
  },
  {
    id: "finale",
    index: "20",
    title: "A record of decisions",
    steps: 4,
    length: 3,
    pinned: true,
    travelDuration: 3.4,
    hold: 2.4,
    stepTravel: 2.6,
    holds: { 2: 3.6, 3: 4 },
    captions: { 2: "A design system is a record of decisions." },
  },
];

export interface PresentationScene {
  id: string;
  index: string;
  title: string;
  target: string;
  travelDuration: number;
  hold: number;
  stops: Stop[];
}

/** The explicit presentation map. */
export const presentationScenes: PresentationScene[] = SCENES.map((s) => {
  const stops: Stop[] = s.pinned
    ? Array.from({ length: s.steps }, (_, i) => ({
        at: (i + 0.5) / s.steps,
        travel: i === 0 ? s.travelDuration : s.stepTravel ?? 2,
        hold: s.holds?.[i] ?? s.hold,
        caption: s.captions?.[i],
      }))
    : [{ at: 0, travel: s.travelDuration, hold: s.hold }, ...(s.extraStops ?? [])];
  return { id: s.id, index: s.index, title: s.title, target: `#${s.id}`, travelDuration: s.travelDuration, hold: s.hold, stops };
});

export const totalDuration = presentationScenes.reduce(
  (t, s) => t + s.stops.reduce((a, b) => a + b.travel + b.hold, 0),
  0,
);
