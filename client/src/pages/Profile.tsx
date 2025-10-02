import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Mail, Calendar, Heart, LogOut, Moon, Sun } from 'lucide-react';

//todo: remove mock functionality - replace with real user data
const mockUser = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  ageRange: '26-35',
  healthConditions: ['IBS', 'Food Sensitivities'],
  dietaryPreferences: ['Vegetarian'],
  memberSince: 'January 2024',
};

interface ProfileProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function Profile({ isDarkMode = false, onToggleDarkMode }: ProfileProps) {
  const initials = mockUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold mb-2">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col items-center gap-4 py-6">
        <Avatar className="w-24 h-24">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="font-display text-xl font-semibold">{mockUser.name}</h2>
          <p className="text-sm text-muted-foreground">{mockUser.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="p-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Age Range</div>
              <div className="text-muted-foreground">{mockUser.ageRange}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Health Conditions</div>
              <div className="text-muted-foreground">{mockUser.healthConditions.join(', ')}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Member Since</div>
              <div className="text-muted-foreground">{mockUser.memberSince}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="font-display font-semibold">Preferences</h3>
        
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-card-border hover-elevate"
            data-testid="button-toggle-theme"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="font-medium">Dark Mode</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transform transition-transform mt-0.5 ${isDarkMode ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        )}

        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-12"
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </Button>
      </div>
    </div>
  );
}
