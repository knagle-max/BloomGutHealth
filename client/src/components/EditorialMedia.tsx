import { useState } from "react";
import {editorialVisualAssetIds} from "@/content/visual-asset-ids";
import { editorialMedia, type EditorialMediaAsset, type EditorialMediaSlot } from "@/content/editorial-media";

interface EditorialMediaProps {
  slot: EditorialMediaSlot;
  variant?: "webp" | "svg";
  sizes: string;
  priority?: boolean;
  showCaption?: boolean;
}

/** Presentation only. Callers determine whether their domain state permits art. */
export default function EditorialMedia({ slot, variant = "webp", sizes, priority = false, showCaption = true }: EditorialMediaProps) {
  const asset: EditorialMediaAsset = editorialMedia[slot];
  // Source changes create a fresh lifecycle; stale failures cannot poison a new slot.
  const sourceKey = `${slot}:${variant}:${asset.raster?.src}:${asset.raster?.src2x}:${asset.svg?.src}:${asset.reserved?.width}:${asset.reserved?.height}`;
  return <MediaSource key={sourceKey} slot={slot} asset={asset} variant={variant} sizes={sizes} priority={priority} showCaption={showCaption} />;
}

function MediaSource({ slot, asset, variant, sizes, priority, showCaption }: EditorialMediaProps & { asset: EditorialMediaAsset }) {
  const [phase, setPhase] = useState<"raster" | "svg" | "failed" | "reserved">(variant === "webp" && asset.raster ? "raster" : asset.svg ? "svg" : "reserved");
  const raster = phase === "raster" ? asset.raster : undefined;
  const image = raster ?? asset.svg;
  const frame = image ?? asset.reserved;
  if (!frame) throw new Error(`Editorial slot ${slot} needs an original source or reserved frame`);
  return <figure className={`bv-media bv-media--${frame.conceptual ? "conceptual" : asset.mode}`} aria-hidden={phase === "reserved" || !showCaption ? true : undefined} style={asset.reserved ? {aspectRatio:`${asset.reserved.width}/${asset.reserved.height}`} : undefined} data-slot={slot} data-bloom-asset-id={editorialVisualAssetIds[slot]} data-bv-slot={asset.placement} data-media-source={phase}>
    {phase === "failed" || phase === "reserved" || !image ? <div className="bv-media-placeholder" aria-hidden="true" /> : <img key={image.src} src={image.src}
      srcSet={raster ? `${raster.src} ${raster.width}w, ${raster.src2x} ${raster.width2x}w` : undefined}
      sizes={raster ? sizes : undefined} width={image.width} height={image.height}
      alt="" aria-hidden="true" decoding="async" loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setPhase(current => current === phase ? phase === "raster" && asset.svg ? "svg" : "failed" : current)} />}
    {showCaption && phase !== "reserved" && frame.conceptual && <figcaption className="bv-media-concept-label">Illustrative, not your data</figcaption>}
  </figure>;
}
