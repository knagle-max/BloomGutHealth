import { Home, Lightbulb, UtensilsCrossed, Activity } from "lucide-react";
import { Link, useLocation } from "wouter";
const navItems = [
  { id: "dashboard", path: "/", icon: Home, label: "Overview" },
  {
    id: "nutrition",
    path: "/nutrition",
    icon: UtensilsCrossed,
    label: "Journal",
  },
  {
    id: "microbiome",
    path: "/microbiome",
    icon: Activity,
    label: "Microbiome",
  },
  { id: "insights", path: "/insights", icon: Lightbulb, label: "Coach" },
];
export default function BottomNav() {
  const [location] = useLocation();
  return (
    <nav className="bloom-bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => (
        <Link
          key={item.id}
          href={item.path}
          aria-current={location === item.path ? "page" : undefined}
          data-testid={`nav-${item.id}`}
        >
          <item.icon size={21} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
