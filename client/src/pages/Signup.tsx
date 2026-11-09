import BloomBrand from "@/components/BloomBrand";
import { useEffect,useRef,useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link,useLocation } from 'wouter';
import {ApiRequestError} from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,setError]=useState(''),errorRef=useRef<HTMLParagraphElement>(null),submitting=useRef(false);
  useEffect(()=>{if(error)errorRef.current?.focus();},[error]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if(submitting.current)return;
    submitting.current=true;setError('');
    setIsLoading(true);

    try {
      await signup(username, password);
      toast({
        title: "Account created!",
        description: `Welcome to Bloom, ${username}!`,
      });
      setLocation('/');
    } catch (cause: unknown) {
      setError(cause instanceof ApiRequestError&&cause.status<500?cause.message:"Your account could not be created. Check your connection and retry.");
    } finally {
      submitting.current=false;
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page min-h-screen flex flex-col" aria-labelledby="signup-title">
      <div className="auth-brand"><BloomBrand /><p>Precision nutrition made practical.</p></div>

      <div className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 id="signup-title" className="font-display text-2xl font-semibold mb-2">Create Account</h1>
          <p className="text-sm text-muted-foreground">Start with a meal. Connect optional biology data when you choose.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4" aria-busy={isLoading} aria-describedby={error?"signup-error":undefined}>
          <fieldset disabled={isLoading} className="space-y-4 min-w-0"><legend className="sr-only">New account credentials</legend>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              type="text"
              placeholder="Choose a username"
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
              autoComplete="new-password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              data-testid="input-password"
            />
          </div>

          </fieldset>
          {error&&<p id="signup-error" role="alert" ref={errorRef} tabIndex={-1} className="auth-error">{error}</p>}
          <Button type="submit" className="w-full h-12" data-testid="button-signup" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            aria-disabled={isLoading}
            onClick={event=>{if(submitting.current)event.preventDefault();}}
            href="/login"
            className="text-sm text-primary font-medium hover-elevate px-4 py-2 rounded"
            data-testid="link-login"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
