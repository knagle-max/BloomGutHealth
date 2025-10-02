import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  userName?: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function AppHeader({ userName = 'User', isDarkMode = false, onToggleDarkMode }: AppHeaderProps) {
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold bg-gradient-to-r from-primary to-[hsl(var(--info))] bg-clip-text text-transparent">
            Bloom
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {onToggleDarkMode && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleDarkMode}
              className="rounded-full"
              data-testid="button-theme-toggle"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          )}
          <Avatar className="w-9 h-9" data-testid="avatar-user">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
