/** Decorative source artwork only. Never used for a recorded biological result. */
export default function EditorialArt({ name }: { name: "bloom-three-leaf-sprig" | "bloom-oatmeal-bowl-primary" }) {
  const base = `/brand/editorial-r4/cutouts/${name}`;
  return <img className="r4-editorial-cutout" src={`${base}-256.webp`} srcSet={`${base}-256.webp 256w, ${base}-512.webp 512w`} sizes="112px" width={256} height={256} alt="" aria-hidden="true" loading="lazy" decoding="async" />;
}
