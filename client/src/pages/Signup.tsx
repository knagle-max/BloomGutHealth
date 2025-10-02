import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';
import heroImage from '@assets/generated_images/Microbiome_hero_background_image_ffdb574d.png';

const healthConditions = ['IBS', 'IBD', 'GERD', 'Food Sensitivities', 'Other'];
const dietaryPreferences = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free'];

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    //todo: remove mock functionality - integrate with Firebase auth
    console.log('Signup:', { name, email, password, ageRange, selectedConditions, selectedDiets });
    setLocation('/');
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  const toggleDiet = (diet: string) => {
    setSelectedDiets(prev =>
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-32 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Microbiome background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-display text-3xl font-bold text-white">Join Bloom</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-8">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Sarah Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="input-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              data-testid="input-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age Range</Label>
            <Select value={ageRange} onValueChange={setAgeRange} required>
              <SelectTrigger id="age" data-testid="select-age">
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-25">18-25</SelectItem>
                <SelectItem value="26-35">26-35</SelectItem>
                <SelectItem value="36-45">36-45</SelectItem>
                <SelectItem value="46-55">46-55</SelectItem>
                <SelectItem value="55+">55+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Health Conditions (Select all that apply)</Label>
            <div className="space-y-2">
              {healthConditions.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={condition}
                    checked={selectedConditions.includes(condition)}
                    onCheckedChange={() => toggleCondition(condition)}
                    data-testid={`checkbox-${condition.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <label
                    htmlFor={condition}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {condition}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dietary Preferences (Optional)</Label>
            <div className="space-y-2">
              {dietaryPreferences.map((diet) => (
                <div key={diet} className="flex items-center space-x-2">
                  <Checkbox
                    id={diet}
                    checked={selectedDiets.includes(diet)}
                    onCheckedChange={() => toggleDiet(diet)}
                    data-testid={`checkbox-${diet.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <label
                    htmlFor={diet}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {diet}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-12" data-testid="button-signup">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setLocation('/login')}
            className="text-sm text-primary font-medium hover-elevate px-4 py-2 rounded"
            data-testid="link-login"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
