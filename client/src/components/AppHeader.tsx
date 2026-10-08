import { Moon, Sun, Sprout, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

interface AppHeaderProps {
  userName?: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}
export const navItems = [
  { path: "/", label: "Overview" },
  { path: "/nutrition", label: "Food journal" },
  { path: "/microbiome", label: "Microbiome" },
  { path: "/insights", label: "Diet coach" },
];

export default function AppHeader({
  userName = "User",
  isDarkMode = false,
  onToggleDarkMode,
}: AppHeaderProps) {
  const [location] = useLocation();
  return (
    <header className="bloom-header">
      <div className="bloom-header-inner">
        <Link href="/" className="bloom-brand" aria-label="Bloom home">
          <span className="brand-mark">
            <Sprout size={25} />
          </span>
          <span>
            bloom<span className="brand-period">.</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              aria-current={location === item.path ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/log-meal" className="header-log">
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
