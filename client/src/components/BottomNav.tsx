import {
  Home,
  Dna,
  CalendarDays,
  UtensilsCrossed,
  Activity,
} from "lucide-react";
import { Link, useLocation } from "wouter";
const navItems = [
  { id: "dashboard", path: "/", icon: Home, label: "Today" },
  { id: "precision", path: "/precision", icon: Dna, label: "Biology" },
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
    label: "Gut reports",
  },
  {
    id: "planner",
    path: "/meal-planner",
    icon: CalendarDays,
    label: "Meal plans",
  },
];
export default function BottomNav() {
  const [location] = useLocation();
  return (
    <nav className="bloom-bottom-nav" aria-label="Main navigation">
      {[navItems[0], navItems[2], navItems[4], navItems[1], navItems[3]].map((item) => (
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
