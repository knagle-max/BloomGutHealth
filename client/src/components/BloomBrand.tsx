import { useExperience } from "@/lib/experience";
/** Original v1 artwork; light/dark means ink colour, not background colour. */
export default function BloomBrand({ icon = false, className = "" }: { icon?: boolean; className?: string }) {
  const { mode } = useExperience();
  return icon ? <img className={`bloom-app-icon ${className}`} src={`/brand/bloom-icon-${mode}.svg`} width={48} height={48} alt="" aria-hidden="true" /> :
    <span className={`bloom-identity ${className}`}>
      <img className="bloom-wordmark bloom-wordmark-ink" src="/brand/bloom-wordmark-dark.svg" width={650} height={160} alt="Bloom" />
      <img className="bloom-wordmark bloom-wordmark-reversed" src="/brand/bloom-wordmark-light.svg" width={650} height={160} alt="Bloom" />
      {mode === "athlete" && <span className="bloom-mode-label">Athlete</span>}
    </span>;
}
