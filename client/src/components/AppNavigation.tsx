import { Link, useLocation } from "wouter";
import { Home, UtensilsCrossed, CalendarDays, Dna, Activity, BookOpen, TrendingUp, Upload, UserRound, ArrowUpRight } from "lucide-react";
export const navigationGroups = [
  { label: "Every day", items: [
    { path: "/", label: "Today", icon: Home },
    { path: "/nutrition", label: "Food journal", icon: UtensilsCrossed },
    { path: "/meal-planner", label: "Meal plans", icon: CalendarDays },
  ] },
  { label: "Your health", items: [
    { path: "/precision", label: "My biology", icon: Dna },
    { path: "/microbiome", label: "Gut reports", icon: Activity },
    { path: "/insights", label: "Diet coach", icon: BookOpen },
    { path: "/health-insights", label: "Progress & insights", icon: TrendingUp },
  ] },
  { label: "Manage", items: [
    { path: "/upload", label: "Add a gut report", icon: Upload },
    { path: "/profile", label: "Profile & settings", icon: UserRound },
  ] },
];
export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  return <nav aria-label="All pages" className="workspace-links">{navigationGroups.map(group => <div key={group.label} className="navigation-group"><p>{group.label}</p>{group.items.map(item => <Link key={item.path} href={item.path} onClick={onNavigate} aria-current={location === item.path ? "page" : undefined}><item.icon size={18} aria-hidden="true" /><span>{item.label}</span>{location === item.path && <span className="active-nav-dot" />}</Link>)}</div>)}</nav>;
}
export default function AppNavigation() {
  return <aside className="workspace-sidebar"><NavigationLinks /><div className="sidebar-note"><span className="eyebrow">MADE PERSONAL</span><p>Your meals. Your biology.<br />A clearer next step.</p><Link href="/precision">Connect your health data <ArrowUpRight size={15} /></Link></div></aside>;
}
