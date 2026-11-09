import type { ReactNode } from "react";

const paths: Record<string, string> = {
  "/": "batch-1-original/icon-today.svg",
  "/precision": "batch-1-original/icon-biology.svg",
  "/progress": "batch-1-original/icon-progress.svg",
  "/nutrition": "batch-1-original/icon-food.svg",
  "/saved-meals": "batch-1-original/icon-food.svg",
  "/activity": "batch-1-original/icon-run.svg",
  "/explore": "batch-1-original/icon-explore.svg",
  "/microbiome": "batch-1-original/icon-biology.svg",
  "/upload": "batch-5-system-onboarding/icon-upload.svg",
  "/profile": "batch-1-original/icon-profile.svg",
  "/plan-day": "batch-5-system-onboarding/icon-calendar.svg",
  "/meal-planner": "batch-5-system-onboarding/icon-calendar.svg",
  "/athlete": "batch-1-original/icon-athlete.svg",
  "/athlete/fueling": "batch-1-original/icon-drop.svg",
  "/athlete/recovery": "batch-1-original/icon-heart-rate.svg",
  "/athlete/competition": "batch-1-original/icon-athlete.svg",
};

/** Original passive SVG geometry as a theme-colored decorative mask.
 * The control's existing visible text supplies its accessible name. */
export default function PremiumIcon({ route, fallback, size = 20 }: { route: string; fallback: ReactNode; size?: number }) {
  const asset = paths[route];
  if (!asset) return fallback;
  const image = `url("/brand/visual-v2/${asset}")`;
  return <>
    <span className="r4-icon" aria-hidden="true" style={{ width: size, height: size, maskImage: image, WebkitMaskImage: image }} />
    <span className="r4-icon-fallback" aria-hidden="true">{fallback}</span>
  </>;
}
