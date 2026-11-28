import { useState,type CSSProperties } from "react";
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
  const sourceKey = `${slot}:${variant}:${asset.raster?.src}:${asset.raster?.src2x}:${asset.raster?.mobile?.src}:${asset.svg?.src}:${asset.reserved?.width}:${asset.reserved?.height}`;
  return <MediaSource key={sourceKey} slot={slot} asset={asset} variant={variant} sizes={sizes} priority={priority} showCaption={showCaption} />;
}

function MediaSource({ slot, asset, variant, sizes, priority, showCaption }: EditorialMediaProps & { asset: EditorialMediaAsset }) {
  const [phase, setPhase] = useState<"raster" | "svg" | "failed" | "reserved">(variant === "webp" && asset.raster ? "raster" : asset.svg ? "svg" : "reserved");
  const [mobileFailed,setMobileFailed]=useState(false);
  const raster = phase === "raster" ? asset.raster : undefined;
  const image = raster ?? asset.svg;
  const frame = image ?? asset.reserved;
  if (!frame) throw new Error(`Editorial slot ${slot} needs an original source or reserved frame`);
  const renderedImage=image?<img key={`${image.src}:${mobileFailed}`} src={image.src}
      srcSet={raster?.src2x ? `${raster.src} ${raster.width}w, ${raster.src2x} ${raster.width2x}w` : undefined}
      sizes={raster ? sizes : undefined} width={image.width} height={image.height}
      alt="" aria-hidden="true" decoding="async" loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => {if(phase==='raster'&&asset.raster?.mobile&&!mobileFailed&&window.matchMedia('(max-width:767px)').matches){setMobileFailed(true);return;}setPhase(current => current === phase ? phase === "raster" && asset.svg ? "svg" : "failed" : current);}} />:null;
  const directed=asset.raster?.mobile;
  return <figure className={`bv-media bv-media--${frame.conceptual ? "conceptual" : asset.mode}`} aria-hidden={phase === "reserved" || !showCaption ? true : undefined} style={directed?{'--bv-directed-ratio':`${asset.raster!.width}/${asset.raster!.height}`,'--bv-directed-mobile-ratio':`${directed.width}/${directed.height}`} as CSSProperties:asset.reserved&&!asset.raster&&!asset.svg ? {aspectRatio:`${asset.reserved.width}/${asset.reserved.height}`} : undefined} data-media-art-directed={directed?'true':undefined} data-slot={slot} data-bloom-asset-id={editorialVisualAssetIds[slot]} data-bv-slot={asset.placement} data-media-source={phase}>
    {phase === "failed" || phase === "reserved" || !image ? <div className="bv-media-placeholder" aria-hidden="true" /> : raster?.mobile?<picture>{!mobileFailed&&<source media="(max-width:767px)" srcSet={raster.mobile.src} width={raster.mobile.width} height={raster.mobile.height}/>}{renderedImage}</picture>:renderedImage}
    {showCaption && phase !== "reserved" && frame.conceptual && <figcaption className="bv-media-concept-label">Illustrative, not your data</figcaption>}
  </figure>;
}
