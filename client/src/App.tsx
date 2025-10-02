import { useState, useEffect } from 'react';
import { Switch, Route, useLocation, Redirect } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/lib/auth';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import Dashboard from '@/pages/Dashboard';
import Upload from '@/pages/Upload';
import Insights from '@/pages/Insights';
import Profile from '@/pages/Profile';
import NutritionHistory from '@/pages/NutritionHistory';
import Microbiome from '@/pages/Microbiome';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/not-found';

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
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

function AppContent() {
  const [location] = useLocation();
  const { user } = useAuth();
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
  const showNav = !isAuthPage && user;

  return (
    <div className="min-h-screen bg-background">
      {showNav && (
        <AppHeader 
          userName={user?.username || "Guest"} 
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/">
          {() => <ProtectedRoute component={Dashboard} />}
        </Route>
        <Route path="/nutrition">
          {() => <ProtectedRoute component={NutritionHistory} />}
        </Route>
        <Route path="/microbiome">
          {() => <ProtectedRoute component={Microbiome} />}
        </Route>
        <Route path="/upload">
          {() => <ProtectedRoute component={Upload} />}
        </Route>
        <Route path="/insights">
          {() => <ProtectedRoute component={Insights} />}
        </Route>
        <Route path="/profile">
          {() => <ProtectedRoute component={ProfileWrapper} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      {showNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
