import { Link } from "wouter";
import { ArrowRight, BookOpen, Camera, ChevronRight, Leaf, Plus, ScanLine, Sparkles, Utensils, Waves } from "lucide-react";
import "./food-editorial-reference.css";

type LoggedFood = {
  id: string;
  mealText?: string | null;
  mealType?: string | null;
  loggedAt?: string | null;
  totalCalories?: number | null;
  totalProtein?: number | null;
};
type DailyReport = {
  meals?: LoggedFood[];
  totals?: Record<string, number | null | undefined>;
  nutritionCoverage?: Record<string, { partial?: boolean }>;
  isPartial?: boolean;
};
type TargetReport = Record<string, unknown>;

/**
 * Food v0.6 editorial reference implementation.
 * Its values are exclusively sourced from the existing owned Food Journal and
 * daily nutrition response. It does not manufacture polyphenols, SCFA, CFU,
 * inflammation, omega ratios, individual sleep effects or plant counts.
 * All entry/edit/history actions remain on the canonical existing routes.
 */
export default function FoodEditorialDashboard({
  daily,
  meals,
  targets,
  onEdit,
  onHistory,
}: {
  daily: DailyReport | null;
  meals: LoggedFood[] | null;
  targets: TargetReport | null;
  onEdit: (id: string) => void;
  onHistory: () => void;
}) {
  const now = new Date();
  const sameDay = (date: string | null | undefined) =>
    !!date && new Date(date).toDateString() === now.toDateString();
  // Prefer the server's date-scoped owned result; use an available full journal
  // only when a daily response is absent. Never claim fallback is complete.
  const entries = daily && Array.isArray(daily.meals)
    ? daily.meals
    : (meals || []).filter((m) => sameDay(m.loggedAt));
  const sorted = [...entries].sort((a, b) =>
    (Date.parse(b.loggedAt || "") || 0) - (Date.parse(a.loggedAt || "") || 0)
  );
  const finite = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0;
  const value = (key: string) => {
    const n = daily?.totals?.[key];
    return finite(n) ? n : null;
  };
  const fiber = value("fiber");
  const fiberTarget = targets?.fiber;
  const validFiberTarget = finite(fiberTarget) && fiberTarget > 0 ? fiberTarget : null;
  const fiberPartial = !!daily?.isPartial || !!daily?.nutritionCoverage?.fiber?.partial;
  const format = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  const fiberPct = fiber !== null && validFiberTarget !== null && !fiberPartial
    ? Math.min(100, Math.round(100 * fiber / validFiberTarget))
    : null;
  const dayTime = (date: string | null | undefined) => date
    ? new Date(date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : "Time not recorded";
  const mealLabel = (text: string | null | undefined) => text?.trim() || "Food entry";
  const energy = value("calories");
  const protein = value("protein");
  const sourcePartial = !daily || !!daily.isPartial;
  return (
    <div className="fe-page" aria-label="Food editorial journal overview">
      <section className="fe-celebration" aria-labelledby="fe-title">
        <div className="fe-celebration-glow" aria-hidden="true" />
        <div className="fe-hero-top">
          <span className="fe-eyebrow"><Leaf size={17} strokeWidth={1.8} aria-hidden="true" /> Cellular ecology</span>
          <span className="fe-context">Your food journal</span>
        </div>
        <h2 id="fe-title">Nourishment &amp; Diversity</h2>
        <p className="fe-hero-sub">
          Build a richer food picture from your recorded meals.
          Plant variety is not yet independently counted from your sources.
        </p>
        <div className="fe-diversity-track" role="status">
          <span className="fe-small-dot" aria-hidden="true" />
          Plant diversity · not measured
        </div>
      </section>

      <section className="fe-pillar-grid" aria-label="Food and biological information">
        <div className="fe-pillar fe-pillar--recorded">
          <div className="fe-pillar-top"><span>Dietary fiber</span><span>{fiberPct !== null ? fiberPct + "%" : "Recorded"}</span></div>
          <strong className="fe-value">{fiber === null ? "—" : format(fiber)}<small>{fiber === null ? " unavailable" : validFiberTarget !== null ? " / " + format(validFiberTarget) + " g" : " g"}</small></strong>
          <div className="fe-track" aria-hidden="true"><div style={{ width: fiberPct === null ? "0%" : fiberPct + "%" }} /></div>
          <p>{fiber === null ? "No verified total" : fiberPartial ? "Known amount · partial coverage" : "From recorded food nutrients"}</p>
        </div>
        <div className="fe-pillar">
          <div className="fe-pillar-top"><span>Polyphenols</span><span>Unverified</span></div>
          <strong className="fe-value fe-value--unknown">—<small> mg</small></strong>
          <div className="fe-track fe-track--unknown" aria-hidden="true" />
          <p>Not quantified by the saved food sources</p>
        </div>
        <div className="fe-pillar">
          <div className="fe-pillar-top"><span>Ω3 : Ω6 Ratio</span><span>Unknown</span></div>
          <strong className="fe-value fe-value--unknown">—<small> ratio</small></strong>
          <div className="fe-track fe-track--unknown" aria-hidden="true" />
          <p>No supported personal ratio available</p>
        </div>
        <div className="fe-pillar">
          <div className="fe-pillar-top"><span>Live cultures</span><span>Unverified</span></div>
          <strong className="fe-value fe-value--unknown">—<small> CFU</small></strong>
          <div className="fe-track fe-track--unknown" aria-hidden="true" />
          <p>Food names do not establish live CFU</p>
        </div>
      </section>

      <section className="fe-quicklog" aria-label="Quick food logging">
        <Link href="/log-meal" className="fe-quicklog-button">
          <Plus size={21} aria-hidden="true"/> Log Food, Snap Photo, or Scan
        </Link>
        <div className="fe-quicklog-note">
          <span><Sparkles size={13} aria-hidden="true" /> Review before saving</span>
          <span>Available methods depend on your connections</span>
        </div>
      </section>

      <section className="fe-meals" aria-labelledby="fe-meals-title">
        <div className="fe-section-heading">
          <h3 id="fe-meals-title">Logged meals today</h3>
          <span>{sorted.length} recorded {sorted.length === 1 ? "entry" : "entries"}</span>
        </div>
        {sourcePartial && <p className="fe-source-note" role="status">
          {daily ? "Nutrition coverage is partial; missing values are not zero." : "Daily totals are unavailable; any displayed entries may be incomplete."}
        </p>}
        {sorted.length === 0 ? (
          <div className="fe-empty">
            <Utensils size={27} strokeWidth={1.5} aria-hidden="true"/>
            <p>No meals recorded for today in the available journal.</p>
            <Link href="/log-meal">Add your first meal <ArrowRight size={17} aria-hidden="true"/></Link>
          </div>
        ) : (
          <div className="fe-meal-list">
            {sorted.map((meal) => (
              <article className="fe-meal" key={meal.id}>
                <div className="fe-meal-meta">
                  <span>{meal.mealType || "Meal"} · {dayTime(meal.loggedAt)}</span>
                  <button type="button" onClick={() => onEdit(meal.id)}
                    aria-label={"Edit " + mealLabel(meal.mealText)} className="fe-edit">Edit <ChevronRight size={16}/></button>
                </div>
                <div className="fe-meal-main">
                  <div className="fe-meal-art" aria-hidden="true"><Utensils size={23} strokeWidth={1.4} /></div>
                  <div className="fe-meal-text">
                    <h4>{mealLabel(meal.mealText)}</h4>
                    <p>{finite(meal.totalCalories) ? format(meal.totalCalories) + " kcal recorded" : "Energy not available"}{finite(meal.totalProtein) ? " · " + format(meal.totalProtein) + " g protein" : ""}</p>
                  </div>
                </div>
                <div className="fe-meal-evidence">
                  <BookOpen size={15} aria-hidden="true"/> Nutrients are reported estimates, not measured cellular effects.
                </div>
              </article>
            ))}
          </div>
        )}
        <button type="button" className="fe-open-history" onClick={onHistory}>
          Browse detailed Food Journal and source history <ArrowRight size={17} aria-hidden="true"/>
        </button>
      </section>

      <section className="fe-next">
        <span className="fe-next-icon" aria-hidden="true"><Waves size={23}/></span>
        <div>
          <p className="fe-eyebrow">For your next meal</p>
          <h3>Find something nourishing</h3>
          <p>Explore ideas based on your saved food preferences and available planning information. No meal is recorded until you confirm it.</p>
          <div className="fe-next-actions">
            <Link href="/plan-day" className="fe-next-primary">Explore meal ideas</Link>
            <button type="button" className="fe-next-secondary" onClick={onHistory}>Review today's food</button>
          </div>
        </div>
      </section>
      <p className="fe-footer-note">Food values are tied to your saved journal. Molecular quantities, unverified plant counts, and individual physiological effects are not inferred.</p>
    </div>
  );
}
