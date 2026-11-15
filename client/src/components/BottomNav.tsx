import PremiumIcon from "@/components/PremiumIcon";
import { useExperience } from "@/lib/experience";
import {primaryNavigation,athletePrimaryNavigation,navigationCurrent} from '@/content/navigation';
import { Link, useLocation } from "wouter";
export default function BottomNav() {
  const [location] = useLocation();
  const {mode}=useExperience();
  const items=mode==='athlete'?athletePrimaryNavigation:primaryNavigation;
  return (
    <nav className="bloom-bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.path}
          aria-current={navigationCurrent(item.path,location,mode)}
          data-testid={`nav-${item.id}`}
        >
          <PremiumIcon route={item.path} size={21} fallback={<item.icon size={21} aria-hidden="true" />} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
