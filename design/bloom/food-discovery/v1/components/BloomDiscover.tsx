import React from "react";
import "./discover.css";
/**
 * Display-only component. Caller supplies a verified and deduplicated food count;
 * never infer ingredients or calculate this number from a photo.
 * Keep feature behind existing Discover/Explore navigation.
 */
export type FoodIdentity = { id: string; name: string; icon?: string; status: "confirmed" | "unconfirmed"; };
export type DiscoverProps = {
  confirmedDistinctCount: number;
  weekLabel: string;
  foods: FoodIdentity[];
  gardenStage: 1 | 2 | 3 | 4;
  onReviewCount: () => void;
  onOpenFood?: () => void;
  onSkip?: () => void;
  assetRoot?: string;
};
export function BloomDiscover({confirmedDistinctCount,weekLabel,foods,gardenStage,onReviewCount,onOpenFood,onSkip,assetRoot="/assets/discover"}:DiscoverProps) {
  const stage = Number.isInteger(gardenStage) && gardenStage>=1 && gardenStage<=4 ? gardenStage : 1;
  const count = Number.isInteger(confirmedDistinctCount) && confirmedDistinctCount>=0 ? confirmedDistinctCount : 0;
  return <main className="bloom-discover">
    <p className="bloom-discover-muted">BLOOM · DISCOVER</p>
    <h1>Explore foods, at your pace</h1>
    <p className="bloom-discover-muted">Enjoy variety and learn something new. Your garden illustrates logged foods, not microbiome health.</p>
    <div className="bloom-discover-grid">
      <section className="bloom-discover-card" aria-labelledby="garden-heading">
        <h2 id="garden-heading">Your gut garden</h2>
        <img className="bloom-garden-art bloom-garden-motion" src={`${assetRoot}/garden/stage-${stage}.svg`} alt={`Illustrative garden stage ${stage} of four`} />
        <p><strong className="bloom-variety-total">{count}</strong> different identified foods this week</p>
        <p className="bloom-discover-muted">{weekLabel} · The garden is an illustration of food variety, not a health score.</p>
        <button className="bloom-discover-action" onClick={onReviewCount}>See what counted</button>
      </section>
      <section className="bloom-discover-card" aria-labelledby="food-heading">
        <h2 id="food-heading">Food of the week</h2>
        <p>Discover one food, a practical preparation, and the research behind it.</p>
        <p className="bloom-discover-muted">Suggestions must be filtered for allergies and excluded foods before this component receives them.</p>
        {onOpenFood && <button className="bloom-discover-action" onClick={onOpenFood}>Explore food</button>}
        {onSkip && <button type="button" onClick={onSkip}>Not interested this week</button>}
        <h2>What counted</h2>
        <div className="bloom-chip-row">{foods.filter(f=>f.status==="confirmed").map(f=><span className="bloom-food-chip" key={f.id}>{f.icon && <img alt="" src={f.icon}/>} {f.name}</span>)}</div>
        {foods.some(f=>f.status==="unconfirmed") && <p className="bloom-discover-muted">Some ingredients need confirmation before they count.</p>}
      </section>
    </div>
  </main>;
}
