"use client";

type ForestLoaderProps = {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "light";
};

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export function ForestLoader({
  className = "",
  label = "Loading",
  size = "md",
  tone = "default",
}: ForestLoaderProps) {
  return (
    <div
      className={`forest-loader ${
        tone === "light" ? "forest-loader-light" : ""
      } inline-flex items-center justify-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <path className="forest-loader-ground" d="M14 52h36" />
        <path className="forest-loader-stem" d="M32 52V25" />
        <path className="forest-loader-branch-left" d="M32 40c-8-1-13-5-16-12" />
        <path className="forest-loader-branch-right" d="M32 36c8-2 13-7 16-15" />
        <circle className="forest-loader-leaf forest-loader-leaf-left" cx="22" cy="25" r="8" />
        <circle className="forest-loader-leaf forest-loader-leaf-top" cx="34" cy="17" r="10" />
        <circle className="forest-loader-leaf forest-loader-leaf-right" cx="45" cy="25" r="8" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
