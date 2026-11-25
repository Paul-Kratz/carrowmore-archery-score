"use client";

import { useEffect } from "react";

const isEditable = (element: Element | null): element is HTMLElement =>
  element instanceof HTMLElement &&
  (element.matches("input:not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])") ||
    element.isContentEditable);

// iOS resizes the visual viewport for the keyboard, leaving dvh and fixed
// elements sized to the layout viewport. Keep the form pages in that visible area.
export function KeyboardViewport() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let baselineHeight = window.innerHeight;
    let baselineWidth = window.innerWidth;
    let keyboardOpen = false;
    let frame: number | undefined;

    const update = () => {
      frame = undefined;
      // Pinch zoom also shrinks the visual viewport; let the browser handle it.
      if (viewport && Math.abs(viewport.scale - 1) > 0.05) {
        root.removeAttribute("data-keyboard-open");
        root.style.removeProperty("--app-viewport-height");
        keyboardOpen = false;
        return;
      }

      const layoutHeight = Math.max(window.innerHeight, root.clientHeight);
      if (window.innerWidth !== baselineWidth) {
        baselineWidth = window.innerWidth;
        baselineHeight = layoutHeight;
        keyboardOpen = false;
      }
      const active = document.activeElement;
      const editing = isEditable(active);
      if (!editing && !keyboardOpen) baselineHeight = layoutHeight;
      const height = viewport?.height ?? window.innerHeight;
      const obscured = Math.max(baselineHeight, layoutHeight) - height > 150;
      keyboardOpen = obscured && (editing || keyboardOpen);
      root.dataset.keyboardOpen = String(keyboardOpen);
      if (keyboardOpen) root.style.setProperty("--app-viewport-height", `${height}px`);
      else root.style.removeProperty("--app-viewport-height");

      if (!keyboardOpen || !editing || active.closest('[role="dialog"], [role="alertdialog"]')) return;
      const target = active.closest("[data-keyboard-focus]") ?? active;
      const rect = target.getBoundingClientRect();
      const top = (viewport?.offsetTop ?? 0) + 16;
      const bottom = (viewport?.offsetTop ?? 0) + height - 16;
      // Keep a whole short form/suggestion list visible. For a taller form, put
      // its start in view and leave the remaining content reachable by scrolling.
      const delta = rect.height > bottom - top || rect.top < top
        ? rect.top - top
        : Math.max(0, rect.bottom - bottom);
      if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: "instant" });
    };

    const schedule = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(update);
    };
    update();
    viewport?.addEventListener("resize", schedule);
    window.addEventListener("resize", schedule);
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", schedule);
    document.addEventListener("input", schedule);
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("focusin", schedule);
      document.removeEventListener("focusout", schedule);
      document.removeEventListener("input", schedule);
      root.removeAttribute("data-keyboard-open");
      root.style.removeProperty("--app-viewport-height");
    };
  }, []);

  return null;
}
