import { clearToasts } from "@/hooks/use-toast";
import { flushSync } from "react-dom";
import { observeSessionChanges } from "./auth-session-events";
import { bindRequestActor } from "./request-actor";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { apiRequest, queryClient } from './queryClient';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authReadEpoch = useRef(0);
  const sessionEvents = useRef<ReturnType<typeof observeSessionChanges>|null>(null);
  const adoptUser = (next: User | null) => {
    bindRequestActor(next?.id ?? null);
    clearToasts();
    setUser(next);
  };
  useEffect(() => {
    const withdraw = () => {
      authReadEpoch.current++;
      bindRequestActor(null);
      clearToasts();
      void queryClient.cancelQueries();
      queryClient.clear();
      // Native page lifecycle events must scrub private DOM before a history snapshot.
      flushSync(() => { setUser(null); setIsLoading(true); });
    };
    const events=observeSessionChanges(withdraw,()=>{void checkAuth();});
    sessionEvents.current=events;
    checkAuth();
    return () => { events.dispose();sessionEvents.current=null;authReadEpoch.current++;bindRequestActor(null); };
  }, []);

  const checkAuth = async () => {
    const readEpoch = ++authReadEpoch.current;
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      const data = await response.json();
      if (readEpoch !== authReadEpoch.current) return;
      await queryClient.cancelQueries();
      if (readEpoch !== authReadEpoch.current) return;
      queryClient.clear();
      adoptUser(response.ok ? data.user || null : null);
    } catch (error) {
      if (readEpoch === authReadEpoch.current) adoptUser(null);
    } finally {
      if (readEpoch === authReadEpoch.current) setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { username, password });
    const data = await response.json();
    
    if (data.success) {
      authReadEpoch.current++;
      sessionEvents.current?.announce();
      await queryClient.cancelQueries();
      queryClient.clear();
      adoptUser(data.user);
      setIsLoading(false);
    }
  };

  const signup = async (username: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/signup', { username, password });
    const data = await response.json();
    
    if (data.success) {
      authReadEpoch.current++;
      sessionEvents.current?.announce();
      await queryClient.cancelQueries();
      queryClient.clear();
      adoptUser(data.user);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),15000);
    try{await apiRequest('POST', '/api/auth/logout', {},undefined,controller.signal);}
    finally{clearTimeout(timeout);}
    authReadEpoch.current++;
    sessionEvents.current?.announce();
    await queryClient.cancelQueries();
    queryClient.clear();
    adoptUser(null);
    setIsLoading(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
