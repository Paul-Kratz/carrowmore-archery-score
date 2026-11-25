import { act, fireEvent, render, screen } from "@testing-library/react";
import { KeyboardViewport } from "./KeyboardViewport";

let viewport: EventTarget & { height: number; scale: number; offsetTop: number };
const originalViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");
const originalHeight = window.innerHeight;
const originalWidth = window.innerWidth;
const originalScrollBy = window.scrollBy;

const resize = (height: number, offsetTop = 0) => {
  act(() => {
    viewport.height = height;
    viewport.offsetTop = offsetTop;
    viewport.dispatchEvent(new Event("resize"));
    jest.advanceTimersByTime(20);
  });
};
const renderForm = () => {
  const result = render(<><KeyboardViewport /><form data-keyboard-focus>
    <label>Archer<input /></label><button>Add archer</button>
  </form></>);
  const input = screen.getByRole("textbox", { name: "Archer" });
  const form = input.closest("form")!;
  jest.spyOn(form, "getBoundingClientRect").mockReturnValue({ top: 400, bottom: 700, height: 300 } as DOMRect);
  act(() => { input.focus(); jest.advanceTimersByTime(20); });
  return { ...result, input, form };
};

beforeEach(() => {
  jest.useFakeTimers();
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  viewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0, scale: 1 });
  Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
  window.scrollBy = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  window.scrollBy = originalScrollBy;
  Object.defineProperty(window, "innerHeight", { configurable: true, value: originalHeight });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth });
  if (originalViewport) Object.defineProperty(window, "visualViewport", originalViewport);
  else Reflect.deleteProperty(window, "visualViewport");
});

it("fits the visible keyboard area and scrolls the form and suggestions above it, accounting for browser panning", () => {
  const { input } = renderForm();
  expect(window.scrollBy).not.toHaveBeenCalled();
  resize(400, 100);
  expect(document.documentElement).toHaveAttribute("data-keyboard-open", "true");
  expect(document.documentElement.style.getPropertyValue("--app-viewport-height")).toBe("400px");
  expect(window.scrollBy).toHaveBeenLastCalledWith({ top: 216, behavior: "instant" });
  // Growing search suggestions must be considered after typing, too.
  (window.scrollBy as jest.Mock).mockClear();
  act(() => { fireEvent.input(input, { target: { value: "Alice" } }); jest.advanceTimersByTime(20); });
  expect(window.scrollBy).toHaveBeenCalledTimes(1);
  resize(844);
  expect(document.documentElement).toHaveAttribute("data-keyboard-open", "false");
  expect(document.documentElement.style.getPropertyValue("--app-viewport-height")).toBe("");
});

it("keeps a taller suggestion list scrollable without putting its search field above the visible area", () => {
  const { form } = renderForm();
  jest.mocked(form.getBoundingClientRect).mockReturnValue({ top: 200, bottom: 800, height: 600 } as DOMRect);
  resize(400);
  expect(window.scrollBy).toHaveBeenLastCalledWith({ top: 184, behavior: "instant" });
});

it("does not treat ordinary browser chrome or pinch zoom as a keyboard", () => {
  renderForm();
  resize(744);
  expect(document.documentElement).toHaveAttribute("data-keyboard-open", "false");
  viewport.scale = 2;
  resize(400);
  expect(document.documentElement).not.toHaveAttribute("data-keyboard-open", "true");
  expect(window.scrollBy).not.toHaveBeenCalled();
});

it("waits for the keyboard to finish closing after focus leaves the field", () => {
  const { input } = renderForm();
  resize(400);
  act(() => { input.blur(); jest.advanceTimersByTime(20); });
  expect(document.documentElement).toHaveAttribute("data-keyboard-open", "true");
  resize(844);
  expect(document.documentElement).toHaveAttribute("data-keyboard-open", "false");
});

it("does not mistake a rotated screen for an open keyboard", () => {
  renderForm();
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 844 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 390 });
  resize(390);
  expect(document.documentElement).toHaveAttribute("data-keyboard-open", "false");
  expect(window.scrollBy).not.toHaveBeenCalled();
});

it("uses window resize when VisualViewport is unavailable", () => {
  Object.defineProperty(window, "visualViewport", { configurable: true, value: null });
  renderForm();
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 400 });
  act(() => { window.dispatchEvent(new Event("resize")); jest.advanceTimersByTime(20); });
  expect(document.documentElement).toHaveAttribute("data-keyboard-open", "true");
  expect(window.scrollBy).toHaveBeenCalledWith({ top: 316, behavior: "instant" });
});

it("removes listeners and resets page styling on unmount", () => {
  const { unmount } = renderForm();
  resize(400);
  unmount();
  expect(document.documentElement).not.toHaveAttribute("data-keyboard-open");
  expect(document.documentElement.style.getPropertyValue("--app-viewport-height")).toBe("");
  (window.scrollBy as jest.Mock).mockClear();
  resize(350);
  expect(window.scrollBy).not.toHaveBeenCalled();
});
