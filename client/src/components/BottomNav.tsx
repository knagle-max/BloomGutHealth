import { Home, PlusCircle, Lightbulb, UtensilsCrossed } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const navItems = [
  { id: 'dashboard', path: '/', icon: Home, label: 'Dashboard' },
  { id: 'log', path: '/log-meal', icon: PlusCircle, label: 'Log Meal' },
  { id: 'nutrition', path: '/nutrition', icon: UtensilsCrossed, label: 'Nutrition' },
  { id: 'insights', path: '/insights', icon: Lightbulb, label: 'Insights' },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-card-border backdrop-blur-lg bg-card/95 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-full max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.id} href={item.path}>
              <button
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all min-h-12 ${
                  isActive 
                    ? 'text-primary scale-110' 
                    : 'text-muted-foreground hover-elevate'
                }`}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
