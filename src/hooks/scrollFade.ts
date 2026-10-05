"use client";

import { useEffect, useRef } from "react";

/**
 * Marks a horizontal scroller with data-more-left / data-more-right
 * so CSS can fade the edge that has more content behind it.
 */
export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.dataset.moreLeft = String(el.scrollLeft > 2);
      el.dataset.moreRight = String(el.scrollLeft < max - 2);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => (el.removeEventListener("scroll", update), ro.disconnect());
  }, []);
  return ref;
}
