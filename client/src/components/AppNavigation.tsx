import PremiumIcon from "@/components/PremiumIcon";
import { useExperience } from "@/lib/experience";
import {useCapabilities} from '@/lib/capabilities';
import { Link, useLocation } from "wouter";
import {ArrowUpRight} from 'lucide-react';
import {navigationGroups,athleteNavigationGroups,navigationCurrent} from '@/content/navigation';
export {navigationGroups} from '@/content/navigation';
export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const {mode}=useExperience();
  const {canReadFeatureAdmin}=useCapabilities();
  const groups=mode==='athlete'?athleteNavigationGroups:navigationGroups;
  return <nav aria-label="All pages" className="workspace-links">{groups.map(group => {
    const links=group.items.map(item=><Link key={item.path} href={item.path} onClick={onNavigate} aria-current={navigationCurrent(item.path,location,mode)}><PremiumIcon route={item.path} size={18} fallback={<item.icon size={18} aria-hidden="true" />} /><span>{item.label}</span>{navigationCurrent(item.path,location,mode)&&<span className="active-nav-dot"/>}</Link>);
    return group.label==="More tools"?<details className="navigation-group navigation-tools" key={group.label} open={group.items.some(i=>i.path===location)||undefined}><summary>More tools</summary>{links}</details>:<div key={group.label} className="navigation-group"><p>{group.label}</p>{links}</div>;
  })}{canReadFeatureAdmin&&<div className="navigation-group"><p>Administration</p><Link href="/admin/features" onClick={onNavigate} aria-current={location==='/admin/features'?'page':undefined}><span>Feature management</span></Link></div>}</nav>;
}
export default function AppNavigation() {
  return <aside className="workspace-sidebar"><NavigationLinks /><div className="sidebar-note"><span className="eyebrow">MADE PERSONAL</span><p>Your meals. Your biology.<br />A clearer next step.</p><Link href="/precision">Connect your health data <ArrowUpRight size={15} /></Link></div></aside>;
}
