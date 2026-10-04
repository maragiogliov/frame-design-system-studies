"use client";

/**
 * The UI kit used by every scene. Each element declares the tokens it consumes
 * in `data-token`. Propagation, highlighting and counting all read that attribute.
 *
 * `inert` renders a non-operable specimen (aria-hidden) — used where the same
 * component appears many times as evidence, not as a control.
 */

import { useId, useState, type CSSProperties, type ReactNode } from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const TOK = {
  buttonPrimary:
    "color.action.primary color.text.onAction radius.control size.control.height space.inset.control type.label.md color.focus.ring",
  buttonSecondary:
    "color.border.strong color.text.primary radius.control size.control.height space.inset.control type.label.md color.focus.ring",
  buttonGhost: "color.action.text radius.control size.control.height space.inset.control type.label.md color.focus.ring",
  buttonDanger: "color.feedback.error color.text.inverse radius.control size.control.height space.inset.control",
  input:
    "color.surface.raised color.border.strong color.text.primary radius.control size.control.height space.inset.control type.body.md color.focus.ring",
  check: "color.action.primary color.border.strong radius.control space.200 color.focus.ring",
  toggle: "color.action.primary color.border.strong space.200 motion.duration.base color.focus.ring",
  tag: "color.action.subtle color.action.text radius.control space.100 space.200",
  nav: "color.action.primary color.text.primary color.text.secondary space.400 space.200",
  menu: "color.surface.raised color.border.subtle color.action.subtle radius.container space.200 space.300",
  dialog: "color.surface.raised color.border.subtle radius.container space.400 space.600",
  table: "color.border.subtle color.action.subtle color.text.primary space.200 space.300",
  toast: "color.surface.inverse color.text.inverse radius.container space.300 color.action.primary",
  tooltip: "color.surface.inverse color.text.inverse radius.control space.100 space.200",
} as const;

/* ------------------------------------------------------------------- icons */

const PATHS: Record<string, string> = {
  arrow: "M3 8h10M9 4l4 4-4 4",
  check: "M3 8.5l3 3 7-7",
  plus: "M8 3v10M3 8h10",
  close: "M4 4l8 8M12 4l-8 8",
  chevron: "M6 4l4 4-4 4",
  chevronDown: "M4 6l4 4 4-4",
  back: "M10 4L6 8l4 4",
  search: "M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10zM11 11l3 3",
  calendar: "M3 4h10v9H3zM3 7h10M6 2v3M10 2v3",
  more: "M3.5 8h.01M8 8h.01M12.5 8h.01",
  filter: "M2 4h12M4.5 8h7M7 12h2",
  bell: "M4 11V7a4 4 0 0 1 8 0v4l1 1H3zM6.5 13.5a1.5 1.5 0 0 0 3 0",
  undo: "M5 6H10a3 3 0 0 1 0 6H7M5 6l2-2M5 6l2 2",
  grid: "M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z",
  user: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2.5 14a5.5 5.5 0 0 1 11 0",
  tag: "M2 2h6l6 6-6 6-6-6zM5 5h.01",
};

export function Icon({ name, size, style }: { name: keyof typeof PATHS | string; size?: number; style?: CSSProperties }) {
  return (
    <svg
      className="ds-icon"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={style}
      data-token="size.icon.md"
    >
      <path d={PATHS[name] ?? PATHS.more} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

/* ------------------------------------------------------------------ button */

export type Intent = "primary" | "secondary" | "ghost" | "danger";
export type BtnState =
  | "default"
  | "hover"
  | "focus"
  | "active"
  | "pressed"
  | "selected"
  | "disabled"
  | "loading"
  | "error";

const intentTokens: Record<Intent, string> = {
  primary: TOK.buttonPrimary,
  secondary: TOK.buttonSecondary,
  ghost: TOK.buttonGhost,
  danger: TOK.buttonDanger,
};

export function Button({
  intent = "primary",
  size = "md",
  state,
  icon,
  iconEnd,
  children,
  inert,
  className,
  style,
  onClick,
  pressed,
  label,
  ...rest
}: {
  intent?: Intent;
  size?: "sm" | "md" | "lg";
  state?: BtnState;
  icon?: string;
  iconEnd?: string;
  children?: ReactNode;
  inert?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  pressed?: boolean;
  label?: string;
  [data: `data-${string}`]: string | undefined;
}) {
  const inner = (
    <>
      {state === "loading" && <span className="ds-spinner" aria-hidden="true" />}
      {icon && <Icon name={icon} />}
      {children !== undefined && <span className="ds-btn__label">{children}</span>}
      {iconEnd && <Icon name={iconEnd} />}
    </>
  );
  const common = {
    className: cx("ds-btn", className),
    "data-intent": intent,
    "data-size": size,
    "data-state": state && state !== "default" ? state : undefined,
    "data-token": intentTokens[intent],
    style,
    ...rest,
  };
  if (inert)
    return (
      <span {...common} aria-hidden="true">
        {inner}
      </span>
    );
  return (
    <button
      type="button"
      {...common}
      onClick={onClick}
      disabled={state === "disabled"}
      aria-busy={state === "loading" || undefined}
      aria-pressed={pressed}
      aria-label={label}
      aria-invalid={state === "error" || undefined}
    >
      {inner}
    </button>
  );
}

/* ------------------------------------------------------------------- input */

export function Field({
  label,
  value,
  placeholder,
  hint,
  error,
  icon,
  inert,
  action,
  state,
  style,
}: {
  label?: string;
  value?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  icon?: string;
  inert?: boolean;
  action?: ReactNode;
  state?: "focus" | "error";
  style?: CSSProperties;
}) {
  const id = useId();
  const err = error ?? (state === "error" ? "Required" : undefined);
  if (inert) {
    return (
      <span className="ds-field" aria-hidden="true" style={style}>
        {label && <span className="ds-field__label">{label}</span>}
        <span className="ds-field__control" data-token={TOK.input} data-state={err ? "error" : state}>
          {icon && <Icon name={icon} />}
          <span className={cx("ds-field__value", !value && "is-placeholder")}>{value || placeholder}</span>
          {action}
        </span>
        {(err || hint) && <span className={cx("ds-field__hint", err && "is-error")}>{err ?? hint}</span>}
      </span>
    );
  }
  return (
    <span className="ds-field" style={style}>
      {label && (
        <label className="ds-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <span className="ds-field__control" data-token={TOK.input} data-state={err ? "error" : state}>
        {icon && <Icon name={icon} />}
        <input
          id={id}
          defaultValue={value}
          placeholder={placeholder}
          aria-invalid={!!err || undefined}
          aria-describedby={err || hint ? `${id}-h` : undefined}
        />
        {action}
      </span>
      {(err || hint) && (
        <span id={`${id}-h`} className={cx("ds-field__hint", err && "is-error")}>
          {err ?? hint}
        </span>
      )}
    </span>
  );
}


/* ---------------------------------------------------------------- checkbox */

export function Checkbox({ label, checked, inert }: { label: ReactNode; checked?: boolean; inert?: boolean }) {
  if (inert)
    return (
      <span className="ds-check" aria-hidden="true">
        <span className="ds-check__box" data-checked={checked || undefined} data-token={TOK.check}>
          {checked && <Icon name="check" />}
        </span>
        <span>{label}</span>
      </span>
    );
  return (
    <label className="ds-check">
      <input type="checkbox" defaultChecked={checked} className="sr-only peer" />
      <span className="ds-check__box" data-token={TOK.check}>
        <Icon name="check" />
      </span>
      <span>{label}</span>
    </label>
  );
}

/* ------------------------------------------------------------------ toggle */

export function Toggle({
  label,
  checked,
  onChange,
  inert,
  defaultChecked,
  hint,
}: {
  label: ReactNode;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  inert?: boolean;
  defaultChecked?: boolean;
  hint?: ReactNode;
}) {
  const [inner, setInner] = useState(!!defaultChecked);
  const on = checked ?? inner;
  const body = (
    <>
      <span className="ds-toggle__track" data-token={TOK.toggle}>
        <span className="ds-toggle__thumb" />
      </span>
      <span className="ds-toggle__text">
        <span>{label}</span>
        {hint && <span className="ds-toggle__hint">{hint}</span>}
      </span>
    </>
  );
  if (inert)
    return (
      <span className="ds-toggle" data-on={on || undefined} aria-hidden="true">
        {body}
      </span>
    );
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className="ds-toggle"
      data-on={on || undefined}
      onClick={() => {
        setInner(!on);
        onChange?.(!on);
      }}
    >
      {body}
    </button>
  );
}

/* ---------------------------------------------------------- small specimens */

export const Tag = ({ children, tone }: { children: ReactNode; tone?: "neutral" }) => (
  <span className="ds-tag" data-tone={tone} data-token={TOK.tag}>
    {children}
  </span>
);

export const Tooltip = ({ children }: { children: ReactNode }) => (
  <span className="ds-tooltip" data-token={TOK.tooltip}>
    {children}
  </span>
);

export function Menu({ items, active = 0 }: { items: [string, string?][]; active?: number }) {
  return (
    <span className="ds-menu" data-token={TOK.menu} aria-hidden="true">
      {items.map(([label, kbd], i) => (
        <span key={label} className="ds-menu__item" data-active={i === active || undefined}>
          <span>{label}</span>
          {kbd && <kbd>{kbd}</kbd>}
        </span>
      ))}
    </span>
  );
}

export function Nav({ items, current = 0 }: { items: string[]; current?: number }) {
  return (
    <span className="ds-nav" data-token={TOK.nav} aria-hidden="true">
      {items.map((it, i) => (
        <span key={it} className="ds-nav__item" data-current={i === current || undefined}>
          {it}
        </span>
      ))}
    </span>
  );
}

export function Dialog({
  title,
  body,
  primary = "Discard",
  secondary = "Keep editing",
  danger,
}: {
  title: string;
  body?: string;
  primary?: string;
  secondary?: string;
  danger?: boolean;
}) {
  return (
    <span className="ds-dialog" data-token={TOK.dialog} aria-hidden="true">
      <span className="ds-dialog__title">{title}</span>
      {body && <span className="ds-dialog__body">{body}</span>}
      <span className="ds-dialog__actions">
        <Button intent="secondary" size="sm" inert>
          {secondary}
        </Button>
        <Button intent={danger ? "danger" : "primary"} size="sm" inert>
          {primary}
        </Button>
      </span>
    </span>
  );
}

export function Table({
  rows,
  selected = 1,
  head = ["Invoice", "Status", "Amount"],
}: {
  rows: [string, string, string][];
  selected?: number;
  head?: string[];
}) {
  return (
    <span className="ds-table" data-token={TOK.table} aria-hidden="true">
      <span className="ds-table__row is-head">
        <span className="ds-check__box" data-token={TOK.check} />
        {head.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </span>
      {rows.map((r, i) => (
        <span key={r[0]} className="ds-table__row" data-selected={i === selected || undefined}>
          <span className="ds-check__box" data-checked={i === selected || undefined} data-token={TOK.check}>
            {i === selected && <Icon name="check" />}
          </span>
          <span className="t-mono-ui">{r[0]}</span>
          <span>
            <Tag>{r[1]}</Tag>
          </span>
          <span className="t-num">{r[2]}</span>
        </span>
      ))}
    </span>
  );
}

export function DatePicker({ selected = 14, range = [14, 17] }: { selected?: number; range?: [number, number] }) {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  return (
    <span className="ds-date" data-token="color.action.primary color.action.subtle radius.control space.100" aria-hidden="true">
      <span className="ds-date__head">
        <span>October</span>
        <span className="ds-date__nav">
          <Button intent="ghost" size="sm" icon="back" inert />
          <Button intent="ghost" size="sm" icon="chevron" inert />
        </span>
      </span>
      <span className="ds-date__grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="ds-date__dow">
            {d}
          </span>
        ))}
        {days.map((d, i) => (
          <span
            key={i}
            className="ds-date__day"
            data-out={d < 1 || d > 31 || undefined}
            data-sel={d === selected || d === range[1] || undefined}
            data-range={(d > range[0] && d < range[1]) || undefined}
          >
            {d < 1 ? 30 + d : d > 31 ? d - 31 : d}
          </span>
        ))}
      </span>
    </span>
  );
}

export const Toast = ({ children, action = "Undo" }: { children: ReactNode; action?: string }) => (
  <span className="ds-toast" data-token={TOK.toast} aria-hidden="true">
    <span>{children}</span>
    <span className="ds-toast__action">{action}</span>
  </span>
);
