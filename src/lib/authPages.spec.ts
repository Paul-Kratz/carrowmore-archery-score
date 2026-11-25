import { authErrorMessage, isPublicAuthPath, safeCallbackPath } from "./authPages";

it.each(["/login", "/login/check-email"])("permits the exact auth page %s", path => {
  expect(isPublicAuthPath(path)).toBe(true);
});
it.each(["/", "/history", "/login/private", "/login/check-email/private", "/login-other"])("keeps %s private", path => {
  expect(isPublicAuthPath(path)).toBe(false);
});
it.each([undefined, "https://other.example/", "//other.example/", "/login", "/login?callbackUrl=/history", "/gate", "/api/auth/signin", "javascript:alert(1)"])("rejects unsafe or looping callback %s", value => {
  expect(safeCallbackPath(value, "https://score.example")).toBe("/");
});
it.each(["/history?year=2026#shoot-1", "https://score.example/history?year=2026#shoot-1"])("preserves a local destination %s", value => {
  expect(safeCallbackPath(value, "https://score.example")).toBe("/history?year=2026#shoot-1");
});
it("does not echo unknown provider error content", () => {
  expect(authErrorMessage("private provider details")).toBe("We couldn’t sign you in. Please try again.");
});
