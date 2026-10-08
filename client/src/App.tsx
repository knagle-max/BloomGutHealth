import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/pages/Dashboard";
const LogMeal = lazy(() => import("@/pages/LogMeal"));
const Upload = lazy(() => import("@/pages/Upload"));
const Profile = lazy(() => import("@/pages/Profile"));
const NutritionHistory = lazy(() => import("@/pages/NutritionHistory"));
const Microbiome = lazy(() => import("@/pages/Microbiome"));
const Insights = lazy(() => import("@/pages/Insights"));
const MealPlanner = lazy(() => import("@/pages/MealPlanner"));
const Demo = lazy(() => import("@/pages/Demo"));
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/not-found";

const ScienceCoach = lazy(() => import("@/pages/ScienceCoach"));

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

function ProfileWrapper({
  isDarkMode,
  onToggleDarkMode,
}: {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}) {
  return (
    <Profile isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
  );
}

function AppContent() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return saved === "dark" || (!saved && prefersDark);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", !isDarkMode ? "dark" : "light");
  };

  const isAuthPage = location === "/login" || location === "/signup";
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
      <Suspense
        fallback={
          <div className="science-page" role="status">
            Loading your page…
          </div>
        }
      >
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/">
            {() => <ProtectedRoute component={Dashboard} />}
          </Route>
          <Route path="/nutrition">
            {() => <ProtectedRoute component={NutritionHistory} />}
          </Route>
          <Route path="/log-meal">
            {() => <ProtectedRoute component={LogMeal} />}
          </Route>
          <Route path="/microbiome">
            {() => <ProtectedRoute component={Microbiome} />}
          </Route>
          <Route path="/upload">
            {() => <ProtectedRoute component={Upload} />}
          </Route>
          <Route path="/demo">
            {() => <ProtectedRoute component={Demo} />}
          </Route>
          <Route path="/health-insights">
            {() => <ProtectedRoute component={Insights} />}
          </Route>
          <Route path="/meal-planner">
            {() => <ProtectedRoute component={MealPlanner} />}
          </Route>
          <Route path="/insights">
            {() => (
              <Suspense
                fallback={
                  <div role="status" className="science-page">
                    Loading the Diet coach…
                  </div>
                }
              >
                <ProtectedRoute component={ScienceCoach} />
              </Suspense>
            )}
          </Route>
          <Route path="/profile">
            {() => (
              <ProtectedRoute
                component={ProfileWrapper}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
              />
            )}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Suspense>
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
