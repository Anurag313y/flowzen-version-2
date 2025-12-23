import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore, DUMMY_CREDENTIALS } from '@/store/authStore';
import { toast } from 'sonner';
import { User, KeyRound, UtensilsCrossed, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = login({ email, password });
    
    setTimeout(() => {
      setIsLoading(false);
      if (result.success) {
        toast.success('Welcome back, Manager!');
        navigate('/');
      } else {
        toast.error(result.error || 'Login failed');
      }
    }, 500);
  };

  const handleWaiterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = login({ pin });
    
    setTimeout(() => {
      setIsLoading(false);
      if (result.success) {
        toast.success('Welcome! Ready to take orders.');
        navigate('/waiter');
      } else {
        toast.error(result.error || 'Invalid PIN');
      }
    }, 500);
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handlePinClear = () => {
    setPin('');
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar-background via-background to-sidebar-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Restaurant POS</h1>
          <p className="text-muted-foreground text-sm">Sign in to continue</p>
        </div>

        <Tabs defaultValue="waiter" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="waiter" className="gap-2">
              <KeyRound className="h-4 w-4" />
              Waiter
            </TabsTrigger>
            <TabsTrigger value="manager" className="gap-2">
              <User className="h-4 w-4" />
              Manager
            </TabsTrigger>
          </TabsList>

          {/* Waiter PIN Login */}
          <TabsContent value="waiter">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Waiter Login</CardTitle>
                <CardDescription>Enter your 4-digit PIN</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWaiterLogin} className="space-y-4">
                  {/* PIN Display */}
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all",
                          pin.length > i
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted"
                        )}
                      >
                        {pin.length > i ? '•' : ''}
                      </div>
                    ))}
                  </div>

                  {/* Numpad */}
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                      <Button
                        key={key}
                        type="button"
                        variant={key === 'C' ? 'destructive' : 'outline'}
                        className={cn(
                          "h-14 text-xl font-semibold",
                          key === '⌫' && "text-base"
                        )}
                        onClick={() => {
                          if (key === 'C') handlePinClear();
                          else if (key === '⌫') handlePinBackspace();
                          else handlePinInput(key);
                        }}
                      >
                        {key}
                      </Button>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={pin.length !== 4 || isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manager Email Login */}
          <TabsContent value="manager">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Manager Login</CardTitle>
                <CardDescription>Enter your credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManagerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="manager@restaurant.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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
                    />
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Demo Credentials */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-medium text-foreground">Demo Credentials:</p>
                <div className="text-muted-foreground space-y-1">
                  <p><strong>Manager:</strong> {DUMMY_CREDENTIALS.manager.email} / {DUMMY_CREDENTIALS.manager.password}</p>
                  <p><strong>Waiters (PIN):</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    {DUMMY_CREDENTIALS.waiters.map((w) => (
                      <li key={w.pin}>{w.name}: {w.pin}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
