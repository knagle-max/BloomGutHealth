import { useExperience } from "@/lib/experience";
import {
  Home,
  Dna,
  CalendarDays,
  UtensilsCrossed,
  Activity,
  Network,
  TrendingUp,
} from "lucide-react";
import { Link, useLocation } from "wouter";
const navItems = [
  { id: "dashboard", path: "/", icon: Home, label: "Today" },
  { id: "precision", path: "/precision", icon: Dna, label: "My biology" },
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
  const {mode}=useExperience();
  const items=mode === "athlete" ? [{id:"athlete",path:"/athlete",icon:Activity,label:"Training"},{id:"fueling",path:"/athlete/fueling",icon:CalendarDays,label:"Fueling"},{id:"nutrition",path:"/nutrition",icon:UtensilsCrossed,label:"Journal"},{id:"recovery",path:"/athlete/recovery",icon:Home,label:"Recovery"},{id:"competition",path:"/athlete/competition",icon:Dna,label:"Compete"}] : [navItems[0],navItems[1],{id:"progress",path:"/progress",icon:TrendingUp,label:"Progress"}];
  return (
    <nav className="bloom-bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
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
