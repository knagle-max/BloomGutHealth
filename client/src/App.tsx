import { ExperienceProvider, useExperience } from "@/lib/experience";
import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import AppNavigation from "@/components/AppNavigation";
import Dashboard from "@/pages/Dashboard";
const Explore = lazy(() => import("@/pages/Explore"));
const Progress = lazy(() => import("@/pages/Progress"));
const AthleteWorkspace = lazy(() => import("@/pages/AthleteWorkspace"));
const PlanDay = lazy(() => import("@/pages/PlanDay"));
const WeeklyReview = lazy(() => import("@/components/WeeklyReview"));
const SavedMeals = lazy(() => import("@/components/SavedMeals"));
const LogMeal = lazy(() => import("@/pages/LogMeal"));
const Upload = lazy(() => import("@/pages/Upload"));
const Profile = lazy(() => import("@/pages/Profile"));
const NutritionHistory = lazy(() => import("@/pages/NutritionHistory"));
const Microbiome = lazy(() => import("@/pages/Microbiome"));
const PrecisionNutrition = lazy(() => import("@/pages/PrecisionNutrition"));
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

function HomeExperience() { const {mode,loading}=useExperience(); if(loading)return <main className="science-page" role="status">Loading your workspace…</main>;return mode==="athlete"?<Redirect to="/athlete"/>:<Dashboard/>; }
function PlannerExperience(){const {mode}=useExperience();return mode==="athlete"?<Redirect to="/athlete/fueling"/>:<MealPlanner/>;}
function AppContent() {
  const [location] = useLocation();
  const {mode}=useExperience();
  const { user } = useAuth();
  useEffect(()=>{document.documentElement.dataset.experience=mode;},[mode]);
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

  useEffect(() => {
    const labels: Record<string, string> = { "/explore":"Explore", "/progress":"Progress", "/athlete":"Training day", "/athlete/fueling":"Athlete fueling", "/athlete/recovery":"Athlete recovery", "/athlete/competition":"Competition", "/plan-day":"Plan my day", "/weekly-review":"Weekly review", "/saved-meals":"Saved meals", "/": "Today", "/nutrition": "Food journal", "/meal-planner": "Meal plans", "/precision": "My biology", "/microbiome": "Gut reports", "/log-meal": "Log a meal", "/upload": "Add a report", "/profile": "Profile", "/insights": "Diet coach", "/health-insights": "Progress & insights" };
    document.title = `${labels[location] || "Welcome"} · Bloom`;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  const isAuthPage = location === "/login" || location === "/signup";
  const showNav = !isAuthPage && user;

  return (
    <div className={showNav ? `app-shell ${mode === "athlete" ? "athlete-mode" : "everyday-mode"} min-h-screen bg-background` : "min-h-screen bg-background"}>
      {showNav && <a href="#workspace-content" className="skip-link">Skip to content</a>}
      {showNav && (
        <AppHeader
          userName={user?.username || "Guest"}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}
      {showNav && <AppNavigation />}
      <div id="workspace-content" tabIndex={-1} className={showNav ? "workspace-content" : undefined}>
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
            {() => <ProtectedRoute component={HomeExperience} />}
          </Route>
          <Route path="/explore"><ProtectedRoute component={Explore}/></Route>
          <Route path="/progress"><ProtectedRoute component={Progress}/></Route>
          <Route path="/athlete/:section"><ProtectedRoute component={AthleteWorkspace}/></Route>
          <Route path="/athlete"><ProtectedRoute component={AthleteWorkspace}/></Route>
          <Route path="/plan-day"><ProtectedRoute component={PlanDay}/></Route>
          <Route path="/weekly-review"><ProtectedRoute component={WeeklyReview}/></Route>
          <Route path="/saved-meals"><ProtectedRoute component={SavedMeals}/></Route>
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
            {() => <Redirect to="/insights" />}
          </Route>
          <Route path="/precision">
            {() => <ProtectedRoute component={PrecisionNutrition} />}
          </Route>
          <Route path="/meal-planner">
            {() => <ProtectedRoute component={PlannerExperience} />}
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
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ExperienceProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
        </ExperienceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
