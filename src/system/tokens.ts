/**
 * The token architecture of this page.
 *
 *   SystemConfig ─▶ primitives ─▶ semantic ─▶ component ─▶ CSS custom properties
 *
 * Nothing on the page hard-codes a colour, a radius or a spacing value.
 * Everything below is pure, so it runs on the server (first paint) and the client.
 */

/* ------------------------------------------------------------------ config */

export type Mode = "light" | "dark";
export type Contrast = "standard" | "high";
export type Motion = "full" | "reduced";
export type Density = "compact" | "comfortable";
export type Brand = "mono" | "a" | "b" | "c";
export type Platform = "web" | "ios" | "android";
export type FocusStyle = "legacy" | "ring";

export interface SystemConfig {
  version: string;
  mode: Mode;
  contrast: Contrast;
  motion: Motion;
  density: Density;
  brand: Brand;
  platform: Platform;
  /** radius.control on web, px */
  radius: number;
  /** space.base, px */
  spaceBase: number;
  /** type.scale ratio */
  typeScale: number;
  focus: FocusStyle;
  /** size.target.min, px */
  targetMin: number;
  /** size.icon.md, px */
  iconSize: number;
  /** optional hard override (v1 had a fixed 32px control) */
  controlHeight?: number;
}

export const BASE_CONFIG: SystemConfig = {
  version: "4.0",
  mode: "light",
  contrast: "standard",
  motion: "full",
  density: "comfortable",
  brand: "a",
  platform: "web",
  radius: 2,
  spaceBase: 4,
  typeScale: 1.25,
  focus: "ring",
  targetMin: 24,
  iconSize: 16,
};

/* -------------------------------------------------------------- primitives */

export const PRIMITIVES = {
  "ink.1000": "#000000",
  "ink.950": "#121110",
  "ink.900": "#1D1C1A",
  "ink.800": "#2A2926",
  "ink.700": "#3B3934",
  "ink.500": "#66635B",
  "ink.400": "#8A877E",
  "ink.300": "#ABA79C",
  "ink.200": "#CDC9BD",
  "ink.100": "#E2DED3",
  "paper.100": "#EAE7DD",
  "paper.50": "#F3F1EA",
  "paper.0": "#FBFAF6",
  white: "#FFFFFF",
  "vermilion.100": "#F5DCD2",
  "vermilion.300": "#F58A6A",
  "vermilion.400": "#F0603A",
  "vermilion.600": "#C8370F",
  "vermilion.700": "#A12A0A",
  "vermilion.900": "#3A1A10",
  "moss.100": "#DCE9DD",
  "moss.300": "#8BC097",
  "moss.400": "#6EA87C",
  "moss.600": "#2E6A3E",
  "moss.800": "#1E4A29",
  "moss.900": "#18291C",
  "ochre.100": "#F3E6BE",
  "ochre.300": "#E2BF55",
  "ochre.400": "#D6AC33",
  "ochre.500": "#C99A1A",
  "ochre.800": "#7A5800",
  "ochre.900": "#2E2508",
  "red.300": "#F2A39D",
  "red.600": "#B3261E",
  "yellow.300": "#FFE14D",
} as const;

export type PrimitiveName = keyof typeof PRIMITIVES;

/* ------------------------------------------------------------------ brands */

type ByMode = Record<Mode, PrimitiveName>;

interface BrandDef {
  name: string;
  action: ByMode;
  hover: ByMode;
  text: ByMode;
  subtle: ByMode;
  on: ByMode;
  hc: ByMode;
  hcOn: ByMode;
  family: "grotesk" | "serif";
  width: number;
  weight: number;
}

export const BRANDS: Record<Brand, BrandDef> = {
  mono: {
    name: "Monochrome",
    action: { light: "ink.900", dark: "paper.50" },
    hover: { light: "ink.700", dark: "ink.200" },
    text: { light: "ink.900", dark: "paper.50" },
    subtle: { light: "ink.100", dark: "ink.800" },
    on: { light: "paper.0", dark: "ink.950" },
    hc: { light: "ink.1000", dark: "white" },
    hcOn: { light: "white", dark: "ink.1000" },
    family: "grotesk",
    width: 100,
    weight: 500,
  },
  a: {
    name: "Signal",
    action: { light: "vermilion.600", dark: "vermilion.400" },
    hover: { light: "vermilion.700", dark: "vermilion.300" },
    text: { light: "vermilion.600", dark: "vermilion.400" },
    subtle: { light: "vermilion.100", dark: "vermilion.900" },
    on: { light: "paper.0", dark: "ink.950" },
    hc: { light: "vermilion.700", dark: "vermilion.300" },
    hcOn: { light: "white", dark: "ink.1000" },
    family: "grotesk",
    width: 112,
    weight: 600,
  },
  b: {
    name: "Moss",
    action: { light: "moss.600", dark: "moss.300" },
    hover: { light: "moss.800", dark: "moss.400" },
    text: { light: "moss.600", dark: "moss.300" },
    subtle: { light: "moss.100", dark: "moss.900" },
    on: { light: "paper.0", dark: "ink.950" },
    hc: { light: "moss.800", dark: "moss.300" },
    hcOn: { light: "white", dark: "ink.1000" },
    family: "serif",
    width: 100,
    weight: 500,
  },
  c: {
    name: "Ochre",
    action: { light: "ochre.500", dark: "ochre.300" },
    hover: { light: "ochre.400", dark: "ochre.400" },
    // ochre.500 fails as text on paper (2.3:1). The semantic layer absorbs it.
    text: { light: "ochre.800", dark: "ochre.300" },
    subtle: { light: "ochre.100", dark: "ochre.900" },
    on: { light: "ink.950", dark: "ink.950" },
    hc: { light: "ochre.800", dark: "ochre.300" },
    hcOn: { light: "white", dark: "ink.1000" },
    family: "grotesk",
    width: 125,
    weight: 800,
  },
};

/* ---------------------------------------------------------------- semantic */

export const COLOR_SEMANTICS = [
  "color.text.primary",
  "color.text.secondary",
  "color.text.disabled",
  "color.text.onAction",
  "color.text.inverse",
  "color.surface.default",
  "color.surface.raised",
  "color.surface.sunken",
  "color.surface.inverse",
  "color.border.subtle",
  "color.border.strong",
  "color.action.primary",
  "color.action.primaryHover",
  "color.action.text",
  "color.action.subtle",
  "color.feedback.error",
  "color.focus.ring",
] as const;

export type ColorSemantic = (typeof COLOR_SEMANTICS)[number];

export function colorRefs(c: SystemConfig): Record<ColorSemantic, PrimitiveName> {
  const m = c.mode;
  const dark = m === "dark";
  const b = BRANDS[c.brand];

  if (c.contrast === "high") {
    return {
      "color.text.primary": dark ? "white" : "ink.1000",
      "color.text.secondary": dark ? "paper.50" : "ink.900",
      "color.text.disabled": dark ? "ink.300" : "ink.500",
      "color.text.onAction": b.hcOn[m],
      "color.text.inverse": dark ? "ink.1000" : "white",
      "color.surface.default": dark ? "ink.1000" : "white",
      "color.surface.raised": dark ? "ink.1000" : "white",
      "color.surface.sunken": dark ? "ink.900" : "paper.50",
      "color.surface.inverse": dark ? "white" : "ink.1000",
      "color.border.subtle": dark ? "paper.50" : "ink.900",
      "color.border.strong": dark ? "white" : "ink.1000",
      "color.action.primary": b.hc[m],
      "color.action.primaryHover": dark ? "white" : "ink.1000",
      "color.action.text": b.hc[m],
      "color.action.subtle": dark ? "ink.800" : "paper.100",
      "color.feedback.error": dark ? "red.300" : "red.600",
      "color.focus.ring": dark ? "yellow.300" : "ink.1000",
    };
  }

  return {
    "color.text.primary": dark ? "paper.50" : "ink.900",
    "color.text.secondary": dark ? "ink.300" : "ink.500",
    "color.text.disabled": dark ? "ink.700" : "ink.300",
    "color.text.onAction": b.on[m],
    "color.text.inverse": dark ? "ink.950" : "paper.50",
    "color.surface.default": dark ? "ink.950" : "paper.50",
    "color.surface.raised": dark ? "ink.900" : "paper.0",
    "color.surface.sunken": dark ? "ink.800" : "paper.100",
    "color.surface.inverse": dark ? "paper.50" : "ink.900",
    "color.border.subtle": dark ? "ink.700" : "ink.200",
    "color.border.strong": dark ? "ink.300" : "ink.700",
    "color.action.primary": b.action[m],
    "color.action.primaryHover": b.hover[m],
    "color.action.text": b.text[m],
    "color.action.subtle": b.subtle[m],
    "color.feedback.error": dark ? "red.300" : "red.600",
    "color.focus.ring": c.focus === "legacy" ? (dark ? "paper.50" : "ink.900") : b.text[m],
  };
}

export const SPACE_STEPS: [string, number][] = [
  ["050", 0.5],
  ["100", 1],
  ["200", 2],
  ["300", 3],
  ["400", 4],
  ["600", 6],
  ["800", 8],
  ["1200", 12],
  ["1600", 16],
];

const even = (n: number) => Math.round(n / 2) * 2;

export interface ResolvedScalars {
  "space.base": number;
  "radius.control": number;
  "radius.container": number;
  "size.control.height": number;
  "size.target.min": number;
  "size.icon.md": number;
  "space.inset.control": number;
  "type.body.md": number;
  "type.label.md": number;
  "type.scale": number;
  "focus.ring.width": number;
  "focus.ring.offset": number;
  "motion.duration.short": number;
  "motion.duration.base": number;
  "motion.duration.long": number;
  "type.display.width": number;
  "type.display.weight": number;
}

export function scalars(c: SystemConfig): ResolvedScalars {
  const compact = c.density === "compact";
  const platformHeight = { web: 36, ios: 44, android: 40 }[c.platform];
  const height = c.controlHeight ?? even(platformHeight * (compact ? 0.84 : 1));
  const radius =
    c.platform === "ios" ? Math.max(c.radius, 10) : c.platform === "android" ? height / 2 : c.radius;
  const container =
    c.platform === "ios" ? 14 : c.platform === "android" ? 16 : c.radius === 0 ? 0 : Math.min(c.radius * 2, 24);
  const body = c.platform === "ios" ? 17 : compact ? 14 : 16;
  const reduced = c.motion === "reduced";
  const b = BRANDS[c.brand];
  return {
    "space.base": c.spaceBase,
    "radius.control": radius,
    "radius.container": container,
    "size.control.height": height,
    "size.target.min": Math.max(c.targetMin, c.platform === "ios" ? 44 : c.platform === "android" ? 48 : 0),
    "size.icon.md": c.iconSize,
    "space.inset.control": c.spaceBase * (compact ? 3 : 4),
    "type.body.md": body,
    "type.label.md": body - 2,
    "type.scale": c.typeScale,
    "focus.ring.width": c.focus === "legacy" ? 1 : c.contrast === "high" ? 3 : 2,
    "focus.ring.offset": c.focus === "legacy" ? 1 : 2,
    "motion.duration.short": reduced ? 0 : 160,
    "motion.duration.base": reduced ? 0 : 360,
    "motion.duration.long": reduced ? 0 : 800,
    "type.display.width": b.width,
    "type.display.weight": b.weight,
  };
}

/* --------------------------------------------------------------- component */

export const COMPONENT_TOKENS: Record<string, string> = {
  "button.primary.background": "color.action.primary",
  "button.primary.backgroundHover": "color.action.primaryHover",
  "button.primary.text": "color.text.onAction",
  "button.secondary.border": "color.border.strong",
  "button.height": "size.control.height",
  "button.radius": "radius.control",
  "button.paddingInline": "space.inset.control",
  "input.background": "color.surface.raised",
  "input.border": "color.border.strong",
  "input.text": "color.text.primary",
  "input.radius": "radius.control",
  "nav.indicator": "color.action.primary",
  "toggle.track.on": "color.action.primary",
  "page.background": "color.surface.default",
  "page.text": "color.text.primary",
  "focus.ring": "color.focus.ring",
};

/* ----------------------------------------------------------------- resolve */

export const cssVar = (token: string) => `--${token.replace(/\./g, "-")}`;
export const v = (token: string) => `var(${cssVar(token)})`;

export function hexOf(p: PrimitiveName) {
  return PRIMITIVES[p];
}

export interface ChainLink {
  name: string;
  layer: "component" | "semantic" | "primitive" | "config";
  value?: string;
}

/** Walk a token down to its raw value. Used to *show* resolution. */
export function resolveChain(token: string, c: SystemConfig): ChainLink[] {
  const chain: ChainLink[] = [];
  let name = token;
  if (COMPONENT_TOKENS[name]) {
    chain.push({ name, layer: "component" });
    name = COMPONENT_TOKENS[name];
  }
  const refs = colorRefs(c);
  if (name in refs) {
    const p = refs[name as ColorSemantic];
    chain.push({ name, layer: "semantic" });
    chain.push({ name: p, layer: "primitive", value: PRIMITIVES[p] });
    return chain;
  }
  const s = scalars(c) as unknown as Record<string, number>;
  if (name in s) {
    chain.push({ name, layer: "semantic", value: fmtScalar(name, s[name]) });
    return chain;
  }
  const space = SPACE_STEPS.find(([k]) => `space.${k}` === name);
  if (space) {
    chain.push({ name, layer: "semantic", value: `${space[1]} × space.base` });
    chain.push({ name: "space.base", layer: "config", value: `${c.spaceBase * space[1]}px` });
    return chain;
  }
  chain.push({ name, layer: "primitive", value: (PRIMITIVES as Record<string, string>)[name] });
  return chain;
}

export function resolveValue(token: string, c: SystemConfig): string {
  const chain = resolveChain(token, c);
  return chain[chain.length - 1]?.value ?? "";
}

function fmtScalar(name: string, n: number) {
  if (name.startsWith("motion")) return `${n}ms`;
  if (name === "type.scale") return `${n}`;
  if (name.startsWith("type.display")) return `${n}`;
  return `${n}px`;
}

/** Everything the page needs, as CSS custom properties. */
export function toCSSVars(c: SystemConfig): Record<string, string> {
  const out: Record<string, string> = {};
  const refs = colorRefs(c);
  for (const k of COLOR_SEMANTICS) out[cssVar(k)] = PRIMITIVES[refs[k]];

  const s = scalars(c);
  for (const [k, n] of Object.entries(s)) {
    out[cssVar(k)] = fmtScalar(k, n);
  }
  for (const [k, mult] of SPACE_STEPS) out[cssVar(`space.${k}`)] = `${c.spaceBase * mult}px`;

  const r = c.typeScale;
  const body = s["type.body.md"];
  out[cssVar("type.heading.sm")] = `${(body * r).toFixed(2)}px`;
  out[cssVar("type.heading.md")] = `${(body * r ** 2).toFixed(2)}px`;
  out[cssVar("type.heading.lg")] = `${(body * r ** 3).toFixed(2)}px`;
  out[cssVar("type.heading.xl")] = `${(body * r ** 4).toFixed(2)}px`;
  // Display sizes are fluid, but still scale with the ratio.
  out[cssVar("type.display.factor")] = `${(r / 1.25).toFixed(3)}`;

  const b = BRANDS[c.brand];
  out[cssVar("type.family.display")] =
    b.family === "serif" ? "var(--font-newsreader), Georgia, serif" : "var(--font-archivo), system-ui, sans-serif";

  // component-level aliases
  for (const [k, ref] of Object.entries(COMPONENT_TOKENS)) out[cssVar(k)] = `var(${cssVar(ref)})`;
  out[cssVar("toggle.radius")] = c.platform === "web" ? `${s["radius.control"]}px` : "999px";
  out["--motion-scale"] = c.motion === "reduced" ? "0" : "1";
  return out;
}

/** Primitives are exposed once, on the root, for specimens that *display* them. Components never read these. */
export function primitiveVars(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(PRIMITIVES)) out[`--p-${k.replace(/\./g, "-")}`] = val;
  return out;
}

/* ---------------------------------------------------------------- contrast */

function lum(hex: string) {
  const n = hex.replace("#", "");
  const ch = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const lin = ch.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrast(a: string, b: string) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function merge(...layers: (Partial<SystemConfig> | null | undefined)[]): SystemConfig {
  const out = { ...BASE_CONFIG } as Record<string, unknown>;
  for (const l of layers) if (l) for (const [k, val] of Object.entries(l)) if (val !== undefined) out[k] = val;
  return out as unknown as SystemConfig;
}

/** For the Themes / Lab readouts. */
export const PLATFORM_LABEL: Record<Platform, string> = { web: "WEB", ios: "IOS", android: "ANDROID" };
