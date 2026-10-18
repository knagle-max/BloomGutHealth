import { Link } from "wouter";
const families = [
  { id: "oats", label: "Oats", pattern: /\boat(s|meal)?\b/i },
  { id: "barley", label: "Barley", pattern: /\bbarley\b/i },
  { id: "lentils", label: "Lentils", pattern: /\blentils?\b/i },
  { id: "chickpeas", label: "Chickpeas", pattern: /\bchickpeas?\b/i },
  { id: "broccoli", label: "Broccoli", pattern: /\bbroccoli\b/i },
  { id: "walnuts", label: "Walnuts", pattern: /\bwalnuts?\b/i },
  { id: "potato", label: "Potato", pattern: /\bpotato(es)?\b/i },
  { id: "yogurt", label: "Yogurt", pattern: /\byog(h)?urt\b/i },
];
export default function FoodRelationshipLinks({ names }: { names: string[] }) {
  const found = families.filter((f) => names.some((n) => f.pattern.test(n)));
  return (
    <details className="food-relationship-links">
      <summary>Why these foods might matter to you</summary>
      <p className="panel-note">
        Explore reviewed research for recognized food families. These links do
        not confirm a preparation, nutrient amount, active organism or personal
        effect.
      </p>
      <div className="flex flex-wrap gap-3">
        {found.map((f) => (
          <Link
            key={f.id}
            href={"/explore?node=food:" + f.id}
            className="text-link"
          >
            {f.label}: food, biology & evidence
          </Link>
        ))}
      </div>
      {!found.length && (
        <p>
          This meal has no matching reviewed biological food family yet. Its
          nutrient estimates remain available above.
        </p>
      )}
    </details>
  );
}
