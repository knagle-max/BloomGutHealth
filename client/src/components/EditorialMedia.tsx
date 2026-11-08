import { useState } from "react";
import { editorialMedia, type EditorialMediaAsset, type EditorialMediaSlot } from "@/content/editorial-media";

interface EditorialMediaProps {
  slot: EditorialMediaSlot;
  variant?: "webp" | "svg";
  sizes: string;
  priority?: boolean;
}

/** Presentation only. Callers determine whether their domain state permits art. */
export default function EditorialMedia({ slot, variant = "webp", sizes, priority = false }: EditorialMediaProps) {
  const asset: EditorialMediaAsset = editorialMedia[slot];
  // Source changes create a fresh lifecycle; stale failures cannot poison a new slot.
  const sourceKey = `${slot}:${variant}:${asset.raster?.src}:${asset.raster?.src2x}:${asset.svg.src}`;
  return <MediaSource key={sourceKey} slot={slot} asset={asset} variant={variant} sizes={sizes} priority={priority} />;
}

function MediaSource({ slot, asset, variant, sizes, priority }: EditorialMediaProps & { asset: EditorialMediaAsset }) {
  const [phase, setPhase] = useState<"raster" | "svg" | "failed">(variant === "webp" && asset.raster ? "raster" : "svg");
  if (phase === "failed") return null;
  const raster = phase === "raster" ? asset.raster : undefined;
  const image = raster ?? asset.svg;
  return <figure className={`bv-media bv-media--${image.conceptual ? "conceptual" : asset.mode}`} data-slot={slot} data-bv-slot={asset.placement} data-media-source={phase}>
    <img key={image.src} src={image.src}
      srcSet={raster ? `${raster.src} ${raster.width}w, ${raster.src2x} ${raster.width2x}w` : undefined}
      sizes={raster ? sizes : undefined} width={image.width} height={image.height}
      alt="" aria-hidden="true" decoding="async" loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setPhase(current => current === phase ? phase === "raster" ? "svg" : "failed" : current)} />
    {image.conceptual && <figcaption className="bv-media-concept-label">Illustrative, not your data</figcaption>}
  </figure>;
}
