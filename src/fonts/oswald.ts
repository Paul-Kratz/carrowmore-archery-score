import localFont from "next/font/local";

export const oswald = localFont({
  src: "./Oswald-Variable.ttf",
  weight: "200 700",
  style: "normal",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});
