import BloomBrand from "./BloomBrand";
import { ExperienceModeToggle, useExperience } from "@/lib/experience";
import { Moon, Sun, Plus, Menu } from "lucide-react";
import { useState } from "react";
import { NavigationLinks, navigationGroups } from "./AppNavigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

interface AppHeaderProps {
  userName?: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}


export default function AppHeader({
  userName = "User",
  isDarkMode = false,
  onToggleDarkMode,
}: AppHeaderProps) {
  const [location] = useLocation();
  const {mode}=useExperience();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = navigationGroups.flatMap(g => g.items).find(i => i.path === location)?.label || (location.startsWith("/athlete") ? "Athlete performance" : "Log a meal");
  return (
    <header className="bloom-header">
      <div className="bloom-header-inner">
        <Link href="/" className="bloom-brand" aria-label="Bloom home">
          <BloomBrand />
        </Link>
        <div className="header-context"><span>YOUR WORKSPACE</span><strong>{current}</strong></div>
        <div className="header-actions">
          <ExperienceModeToggle/>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild><Button className="mobile-menu-trigger" variant="ghost" size="icon" aria-label="Open navigation"><Menu size={20} /></Button></SheetTrigger>
            <SheetContent side="left" className="mobile-navigation-sheet">
              <SheetHeader><SheetTitle>Explore Bloom</SheetTitle><SheetDescription>Your daily tools and health information.</SheetDescription></SheetHeader>
              <NavigationLinks onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/log-meal" className="header-log" aria-label="Log a meal" title="Log a meal">
            <Plus size={16} /> Log meal
          </Link>
          {onToggleDarkMode && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleDarkMode}
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              data-testid="button-theme-toggle"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          )}
          <Link
            href="/profile"
            className="profile-link"
            aria-label={`Profile for ${userName}`}
            data-testid="avatar-user"
          >
            {userName.slice(0, 2).toUpperCase()}
          </Link>
        </div>
      </div>
    </header>
  );
}
