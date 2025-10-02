import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import heroImage from '@assets/generated_images/Microbiome_hero_background_image_ffdb574d.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(username, password);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${username}`,
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Microbiome background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-display text-4xl font-bold text-white">Bloom</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-semibold mb-2">Welcome Back</h2>
          <p className="text-sm text-muted-foreground">Sign in to continue your gut health journey</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
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
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-password"
            />
          </div>

          <Button type="submit" className="w-full h-12" data-testid="button-login" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setLocation('/signup')}
            className="text-sm text-primary font-medium hover-elevate px-4 py-2 rounded"
            data-testid="link-signup"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
