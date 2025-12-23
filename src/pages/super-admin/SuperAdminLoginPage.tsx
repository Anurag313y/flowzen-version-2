import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSuperAdminStore, SUPER_ADMIN_CREDENTIALS } from '@/store/superAdminStore';
import { toast } from 'sonner';
import { Shield, Info, Eye, EyeOff } from 'lucide-react';

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { loginSuperAdmin } = useSuperAdminStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Apply dark mode for login page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = loginSuperAdmin(email, password);
    
    setTimeout(() => {
      setIsLoading(false);
      if (result.success) {
        toast.success('Welcome to Flozen Super Admin!');
        navigate('/super-admin');
      } else {
        toast.error(result.error || 'Login failed');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
            <Shield className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Flozen</h1>
            <p className="text-primary font-semibold text-sm tracking-widest uppercase mt-1">Super Admin Portal</p>
          </div>
          <p className="text-muted-foreground text-sm">Enterprise Management Console</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-foreground">Secure Login</CardTitle>
            <CardDescription>
              Access restricted to authorized personnel only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@flozen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-secondary border-border pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base" 
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Access Dashboard'}
              </Button>
              
              <div className="text-center">
                <Button variant="link" className="text-primary text-sm h-auto p-0">
                  Forgot Password?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-secondary/50 border-dashed border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 text-sm">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">Demo Credentials:</p>
                <div className="text-muted-foreground space-y-0.5">
                  <p><strong className="text-foreground/80">Email:</strong> {SUPER_ADMIN_CREDENTIALS.email}</p>
                  <p><strong className="text-foreground/80">Password:</strong> {SUPER_ADMIN_CREDENTIALS.password}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-xs">
          © 2024 Flozen SaaS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
