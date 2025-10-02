import { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import Dashboard from '@/pages/Dashboard';
import LogMeal from '@/pages/LogMeal';
import Upload from '@/pages/Upload';
import Insights from '@/pages/Insights';
import Profile from '@/pages/Profile';
import NutritionHistory from '@/pages/NutritionHistory';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/" component={Dashboard} />
      <Route path="/log-meal" component={LogMeal} />
      <Route path="/nutrition" component={NutritionHistory} />
      <Route path="/upload" component={Upload} />
      <Route path="/insights" component={Insights} />
      <Route path="/profile">
        {(params) => <ProfileWrapper />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ProfileWrapper() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  return <Profile isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />;
}

function App() {
  const [location] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return saved === 'dark' || (!saved && prefersDark);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const isAuthPage = location === '/login' || location === '/signup';
  const showNav = !isAuthPage;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {showNav && (
            <AppHeader 
              userName="Sarah Johnson" 
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          )}
          <Router />
          {showNav && <BottomNav />}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
