import BloomBrand from "@/components/BloomBrand";
import { useEffect,useRef,useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link,useLocation } from 'wouter';
import {ApiRequestError} from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,setError]=useState(''),errorRef=useRef<HTMLParagraphElement>(null),submitting=useRef(false);
  useEffect(()=>{if(error)errorRef.current?.focus();},[error]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if(submitting.current)return;
    submitting.current=true;setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${username}`,
      });
      setLocation('/');
    } catch (cause: unknown) {
      setError(cause instanceof ApiRequestError&&cause.status<500?cause.message:"Sign-in could not be completed. Check your connection and retry.");
    } finally {
      submitting.current=false;
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page min-h-screen flex flex-col" aria-labelledby="login-title">
      <div className="auth-brand"><BloomBrand /><p>Precision nutrition made practical.</p></div>

      <div className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 id="login-title" className="font-display text-2xl font-semibold mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to review your food, activity and biology.</p>
        </div>

        {new URLSearchParams(window.location.search).get("accountDeleted")==="1" && <p role="status" className="panel-note mb-4">Your account and active app records were deleted. Backups, operational logs and external-provider records are outside this deletion.</p>}
        <form onSubmit={handleLogin} className="space-y-4" aria-busy={isLoading} aria-describedby={error?"login-error":undefined}>
          <fieldset disabled={isLoading} className="space-y-4 min-w-0"><legend className="sr-only">Sign-in credentials</legend>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              data-testid="input-username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              autoComplete="current-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-password"
            />
          </div>

          </fieldset>
          {error&&<p id="login-error" role="alert" ref={errorRef} tabIndex={-1} className="auth-error">{error}</p>}
          <Button type="submit" className="w-full h-12" data-testid="button-login" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            aria-disabled={isLoading}
            onClick={event=>{if(submitting.current)event.preventDefault();}}
            href="/signup"
            className="text-sm text-primary font-medium hover-elevate px-4 py-2 rounded"
            data-testid="link-signup"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
