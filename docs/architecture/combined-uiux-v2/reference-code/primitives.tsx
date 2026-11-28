import * as React from "react";
import { cn } from "@/lib/utils";
import CompanionHero from "@/components/CompanionHero";
import "./today-editorial.css";

/**
 * Presentation-only surfaces. Do not use these variants to imply a clinical
 * classification, verified reference interval, or data availability.
 */
export interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "editorial" | "telemetry" | "glass";
}

export const SurfaceCard = React.forwardRef<HTMLDivElement, SurfaceCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bloom-surface min-w-0 rounded-2xl border border-border text-foreground",
        variant === "default" && "bg-card shadow-sm",
        variant === "editorial" && "bg-gradient-to-br from-card via-card to-muted/70 shadow-md",
        variant === "telemetry" && "bg-muted/40 shadow-inner",
        variant === "glass" && "bg-card/85 shadow-sm supports-[backdrop-filter]:bg-card/75 supports-[backdrop-filter]:backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
SurfaceCard.displayName = "SurfaceCard";

/** A recorded/derived metric display. Status is explicitly supplied, never inferred. */
export interface TelemetryMetricProps {
  label: string;
  value: string | number | null;
  unit?: string;
  statusLabel?: string;
  trendLabel?: string;
  sourceLabel?: string;
  className?: string;
}
export function TelemetryMetric({
  label, value, unit, statusLabel, trendLabel, sourceLabel, className,
}: TelemetryMetricProps) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <div className="text-xs font-medium tracking-wide text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-3xl font-medium tracking-tight tabular-nums text-foreground">
          {value === null ? "Not available" : value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {statusLabel && <p className="text-xs text-muted-foreground">{statusLabel}</p>}
      {trendLabel && <p className="text-xs text-muted-foreground">{trendLabel}</p>}
      {sourceLabel && <p className="text-xs text-muted-foreground">Source: {sourceLabel}</p>}
    </div>
  );
}

/**
 * Editorial hero is a skin on the EXISTING CompanionHero. It retains
 * aria-labelledby, its focusable h2, image slot, and existing action structure.
 * No second independent hero implementation is introduced.
 */
export interface EditorialHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions: React.ReactNode;
  children?: React.ReactNode;
  media?: React.ReactNode;
  className?: string;
  headingId?: string;
  icon?: string;
}
export function EditorialHero({
  description, className, headingId = "today-action-title", ...props
}: EditorialHeroProps) {
  return (
    <CompanionHero
      {...props}
      headingId={headingId}
      reason={description}
      className={cn("today-focus--editorial", className)}
    />
  );
}