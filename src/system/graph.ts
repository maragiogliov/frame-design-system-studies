/**
 * One dependency graph for the whole study.
 * An edge A → B means: "a change to A requires attention in B".
 */

export type NodeKind = "primitive" | "mode" | "token" | "component" | "pattern" | "product";

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  note: string;
}

export const COLUMNS: { kind: NodeKind; label: string }[] = [
  { kind: "primitive", label: "Primitives" },
  { kind: "mode", label: "Modes & platforms" },
  { kind: "token", label: "Semantic tokens" },
  { kind: "component", label: "Components" },
  { kind: "pattern", label: "Patterns" },
  { kind: "product", label: "Products" },
];

const n = (id: string, kind: NodeKind, note: string, label = id): GraphNode => ({ id, label, kind, note });

export const NODES: GraphNode[] = [
  n("vermilion", "primitive", "Raw brand hue. Never referenced by a component."),
  n("ink", "primitive", "Neutral scale, 100–1000."),
  n("paper", "primitive", "Warm light neutrals."),
  n("yellow.300", "primitive", "Exists only for high-contrast dark."),
  n("grid.4", "primitive", "The 4px unit everything spatial is counted in."),

  n("Light", "mode", "Maps primitives to meaning for light surfaces."),
  n("Dark", "mode", "Same meanings, different primitives."),
  n("High contrast", "mode", "A third map. Not a filter on top of the others."),
  n("Compact", "mode", "Density: shorter controls, tighter insets."),
  n("Web", "mode", "Pointer + keyboard. 36px controls."),
  n("iOS", "mode", "Touch. 44pt targets, 17pt body."),
  n("Android", "mode", "Touch. 48dp targets, full-round controls."),

  n("color.action.primary", "token", "The decision behind every primary action."),
  n("color.text.primary", "token", "Body text on default surfaces."),
  n("color.surface.default", "token", "The ground everything sits on."),
  n("color.border.subtle", "token", "Separation without emphasis."),
  n("color.focus.ring", "token", "Where the keyboard is. Must reach 3:1."),
  n("radius.control", "token", "Corner of anything you can operate."),
  n("space.base", "token", "Multiplied into every gap and inset."),
  n("size.control.height", "token", "Height of buttons, inputs, selects."),
  n("type.body.md", "token", "Default reading size."),
  n("size.icon.md", "token", "Icon box inside controls."),
  n("motion.duration.base", "token", "Resolves to 0 under reduced motion."),

  n("Button", "component", "Used by 4 other components directly."),
  n("IconButton", "component", "A Button with no visible label — needs an accessible name."),
  n("Input", "component", "Label, field, hint, error. One focus target."),
  n("Checkbox", "component", "Three states: off, on, mixed."),
  n("Toggle", "component", "role=switch. Applies immediately."),
  n("Menu", "component", "Roving focus, typeahead, Escape closes."),
  n("Dialog", "component", "Traps focus, restores it on close."),
  n("Table", "component", "Selection, sort, density."),
  n("DatePicker", "component", "Grid navigation, locale, time zones."),
  n("Toast", "component", "Announced politely. Never the only record."),
  n("Tag", "component", "Static or removable."),
  n("Nav", "component", "aria-current marks the page."),

  n("Sign-in form", "pattern", "Fields, errors, submit, recovery."),
  n("Filter bar", "pattern", "Search + tags + menu."),
  n("Confirm destructive", "pattern", "Dialog with the safe action focused."),
  n("Data view", "pattern", "Table + filters + bulk actions."),
  n("Notifications", "pattern", "Toast + inbox."),
  n("Settings page", "pattern", "Nav + grouped toggles + inputs."),

  n("Checkout", "product", "Revenue-critical. Changes need sign-off."),
  n("Admin console", "product", "Dense, keyboard-heavy."),
  n("Editorial site", "product", "Expression over density."),
  n("Mobile app", "product", "iOS and Android from one source."),
  n("This study", "product", "The page you are reading consumes the system it describes."),
];

const E = (from: string, ...to: string[]) => to.map((t) => [from, t] as [string, string]);

export const EDGES: [string, string][] = [
  ...E("vermilion", "Light", "Dark", "High contrast"),
  ...E("ink", "Light", "Dark", "High contrast"),
  ...E("paper", "Light", "Dark", "High contrast"),
  ...E("yellow.300", "High contrast"),
  ...E("grid.4", "space.base", "Compact", "Web", "iOS", "Android"),

  ...E("Light", "color.action.primary", "color.text.primary", "color.surface.default", "color.border.subtle", "color.focus.ring"),
  ...E("Dark", "color.action.primary", "color.text.primary", "color.surface.default", "color.border.subtle", "color.focus.ring"),
  ...E("High contrast", "color.action.primary", "color.text.primary", "color.surface.default", "color.border.subtle", "color.focus.ring"),
  ...E("Compact", "space.base", "size.control.height", "type.body.md"),
  ...E("Web", "radius.control", "size.control.height"),
  ...E("iOS", "radius.control", "size.control.height", "type.body.md"),
  ...E("Android", "radius.control", "size.control.height"),

  ...E("color.action.primary", "Button", "Checkbox", "Toggle", "Tag", "Nav", "DatePicker", "This study"),
  ...E("color.text.primary", "Input", "Menu", "Table", "Nav"),
  ...E("color.surface.default", "Input", "Menu", "Dialog", "Toast"),
  ...E("color.border.subtle", "Input", "Checkbox", "Dialog", "Table"),
  ...E("color.focus.ring", "Button", "Input", "Checkbox", "Toggle", "Menu", "Nav"),
  ...E("radius.control", "Button", "Input", "Checkbox", "Tag", "DatePicker"),
  ...E("space.base", "Button", "Input", "Menu", "Dialog", "Table", "DatePicker", "Tag", "Nav"),
  ...E("size.control.height", "Button", "Input"),
  ...E("type.body.md", "Button", "Input", "Menu", "Table", "Tag", "Nav"),
  ...E("size.icon.md", "Button", "IconButton", "Checkbox", "Menu", "Toast"),
  ...E("motion.duration.base", "Button", "Toggle", "Dialog", "Toast", "This study"),

  ...E("Button", "IconButton", "Dialog", "DatePicker", "Toast", "This study"),
  ...E("IconButton", "DatePicker", "Filter bar", "Notifications"),
  ...E("Checkbox", "Table", "Sign-in form", "Data view"),
  ...E("Menu", "Filter bar", "Data view"),
  ...E("Input", "Sign-in form", "Filter bar", "Settings page"),
  ...E("Toggle", "Settings page", "Mobile app", "This study"),
  ...E("Dialog", "Confirm destructive"),
  ...E("Table", "Data view"),
  ...E("Toast", "Notifications"),
  ...E("Tag", "Filter bar", "Editorial site", "This study"),
  ...E("Nav", "Settings page", "Editorial site", "This study"),
  ...E("DatePicker", "Checkout"),

  ...E("Sign-in form", "Checkout", "Editorial site"),
  ...E("Filter bar", "Data view"),
  ...E("Confirm destructive", "Checkout", "Admin console"),
  ...E("Data view", "Admin console"),
  ...E("Notifications", "Checkout", "Mobile app"),
  ...E("Settings page", "Admin console", "Mobile app"),
  ...E("iOS", "Mobile app"),
  ...E("Android", "Mobile app"),
];

export const byId = new Map(NODES.map((x) => [x.id, x]));

const down = new Map<string, string[]>();
const up = new Map<string, string[]>();
for (const [a, b] of EDGES) {
  if (!down.has(a)) down.set(a, []);
  if (!up.has(b)) up.set(b, []);
  down.get(a)!.push(b);
  up.get(b)!.push(a);
}

export const directDependents = (id: string) => down.get(id) ?? [];
export const directDependencies = (id: string) => up.get(id) ?? [];

/** Breadth-first, so propagation can be animated in waves. */
export function downstreamWaves(id: string): string[][] {
  const seen = new Set([id]);
  const waves: string[][] = [];
  let frontier = [id];
  while (frontier.length) {
    const next: string[] = [];
    for (const f of frontier) for (const d of down.get(f) ?? []) if (!seen.has(d)) (seen.add(d), next.push(d));
    if (next.length) waves.push(next);
    frontier = next;
  }
  return waves;
}

export function upstream(id: string): Set<string> {
  const seen = new Set<string>();
  const stack = [id];
  while (stack.length) for (const u of up.get(stack.pop()!) ?? []) if (!seen.has(u)) (seen.add(u), stack.push(u));
  return seen;
}

export const downstream = (id: string) => new Set(downstreamWaves(id).flat());

/* ------------------------------------------------------ breaking changes */

export interface BreakingChange {
  id: string;
  label: string;
  diff: string;
  origin: string[];
  release: "major" | "minor";
  /** what each kind of affected node has to do */
  work: Partial<Record<NodeKind, string>>;
  /** relative effort per affected node */
  weight: Partial<Record<NodeKind, number>>;
}

export const BREAKING_CHANGES: BreakingChange[] = [
  {
    id: "rename",
    label: "Rename a token",
    diff: "color.action.primary → color.action.default",
    origin: ["color.action.primary"],
    release: "major",
    work: {
      component: "update the reference (codemod)",
      pattern: "rebuild, no code change",
      product: "update any direct references; ship an alias for one major",
    },
    weight: { component: 1, pattern: 0, product: 1 },
  },
  {
    id: "focus",
    label: "Change the focus ring",
    diff: "focus.ring 2px → 3px, offset 2px",
    origin: ["color.focus.ring"],
    release: "minor",
    work: {
      component: "re-baseline visual snapshots; check clipping in overflow containers",
      pattern: "check focus is not clipped by scroll areas",
      product: "visual review of dense layouts",
    },
    weight: { component: 2, pattern: 1, product: 1 },
  },
  {
    id: "space",
    label: "Change default spacing",
    diff: "space.base 4px → 8px",
    origin: ["space.base"],
    release: "major",
    work: {
      component: "every inset and gap changes; re-baseline all snapshots",
      pattern: "layouts reflow; re-check breakpoints",
      product: "full visual QA; density opt-out for data-heavy screens",
    },
    weight: { component: 3, pattern: 3, product: 5 },
  },
  {
    id: "icon",
    label: "Change icon size",
    diff: "size.icon.md 16px → 20px",
    origin: ["size.icon.md"],
    release: "minor",
    work: {
      component: "control height may grow; check alignment with text baseline",
      pattern: "toolbars and table rows may overflow",
      product: "review fixed-height layouts",
    },
    weight: { component: 2, pattern: 2, product: 2 },
  },
];

export function impact(change: BreakingChange) {
  const affected = new Set<string>();
  const waves: string[][] = [];
  for (const o of change.origin) {
    downstreamWaves(o).forEach((w, i) => {
      waves[i] = waves[i] ?? [];
      for (const x of w) if (!affected.has(x)) (affected.add(x), waves[i].push(x));
    });
  }
  const count: Record<NodeKind, number> = { primitive: 0, mode: 0, token: 0, component: 0, pattern: 0, product: 0 };
  let cost = 0;
  for (const id of affected) {
    const k = byId.get(id)!.kind;
    count[k]++;
    cost += change.weight[k] ?? 0;
  }
  return { affected, waves, count, cost };
}
