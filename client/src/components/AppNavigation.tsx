import { useExperience } from "@/lib/experience";
import {useCapabilities} from '@/lib/capabilities';
import { Link, useLocation } from "wouter";
import { Home, UtensilsCrossed, CalendarDays, Dna, Activity, BookOpen, TrendingUp, Network, Upload, UserRound, ArrowUpRight } from "lucide-react";
export const navigationGroups = [
  { label: "Your day", items: [
    { path: "/", label: "Today", icon: Home },
    { path: "/explore", label: "Explore", icon: Network },
    { path: "/progress", label: "Progress", icon: TrendingUp },
  ] },
  { label: "More tools", items: [
    { path: "/nutrition", label: "Food journal", icon: UtensilsCrossed },
    { path: "/plan-day", label: "Plan my day", icon: CalendarDays },
    { path: "/meal-planner", label: "Meal plans", icon: CalendarDays },
    { path: "/saved-meals", label: "Saved meals", icon: UtensilsCrossed },
    { path: "/precision", label: "My biology", icon: Dna },
    { path: "/microbiome", label: "Gut reports", icon: Activity },
    { path: "/insights", label: "Diet coach", icon: BookOpen },
  ] },
  { label: "Manage", items: [
    { path: "/upload", label: "Add a gut report", icon: Upload },
    { path: "/profile", label: "Profile, privacy & export", icon: UserRound },
  ] },
];
export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const {mode}=useExperience();
  const {canReadFeatureAdmin}=useCapabilities();
  const groups=mode === "athlete" ? [
    {label:"Performance",items:[{path:"/athlete",label:"Training day",icon:Activity},{path:"/athlete/fueling",label:"Fueling & hydration",icon:CalendarDays},{path:"/athlete/recovery",label:"Recovery & response",icon:TrendingUp},{path:"/athlete/competition",label:"Competition & clean sport",icon:BookOpen}]},
    {label:"Shared tools",items:[{path:"/explore",label:"Explore biology",icon:Network},{path:"/progress",label:"Progress",icon:TrendingUp},{path:"/nutrition",label:"Food journal",icon:UtensilsCrossed},{path:"/saved-meals",label:"Saved meals",icon:UtensilsCrossed},{path:"/precision",label:"My biology",icon:Dna},{path:"/microbiome",label:"Gut reports",icon:Activity}]}, navigationGroups[2]
  ] : navigationGroups;
  return <nav aria-label="All pages" className="workspace-links">{groups.map(group => {
    const links=group.items.map(item=><Link key={item.path} href={item.path} onClick={onNavigate} aria-current={location===item.path?"page":undefined}><item.icon size={18} aria-hidden="true"/><span>{item.label}</span>{location===item.path&&<span className="active-nav-dot"/>}</Link>);
    return group.label==="More tools"?<details className="navigation-group navigation-tools" key={group.label} open={group.items.some(i=>i.path===location)||undefined}><summary>More tools</summary>{links}</details>:<div key={group.label} className="navigation-group"><p>{group.label}</p>{links}</div>;
  })}{canReadFeatureAdmin&&<div className="navigation-group"><p>Administration</p><Link href="/admin/features" onClick={onNavigate} aria-current={location==='/admin/features'?'page':undefined}><span>Feature management</span></Link></div>}</nav>;
}
export default function AppNavigation() {
  return <aside className="workspace-sidebar"><NavigationLinks /><div className="sidebar-note"><span className="eyebrow">MADE PERSONAL</span><p>Your meals. Your biology.<br />A clearer next step.</p><Link href="/precision">Connect your health data <ArrowUpRight size={15} /></Link></div></aside>;
}
