import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { restaurantAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Salad, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'user';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as 'email' | 'password'] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      setLoading(false);
      toast({
        title: 'Login failed',
        description: error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
      return;
    }

    // Get the updated user from localStorage (set by signIn)
    const userDataStr = localStorage.getItem('user');
    const userData = userDataStr ? JSON.parse(userDataStr) : null;

    // Priority 1: Check if user is admin
    if (userData?.roles?.includes('admin')) {
      setLoading(false);
      toast({ title: 'Welcome back, Admin!', description: 'Redirecting to admin dashboard...' });
      navigate('/admin/dashboard');
      return;
    }

    // Priority 2: Check if user has delivery-partner role
    if (userData?.roles?.includes('delivery-partner')) {
      setLoading(false);
      toast({ title: 'Welcome back!', description: 'Redirecting to delivery partner dashboard...' });
      navigate('/delivery-partner/dashboard');
      return;
    }

    // Priority 3: Check if user has provider role
    if (userData?.roles?.includes('provider')) {
      setLoading(false);
      toast({ title: 'Welcome back!', description: 'Redirecting to restaurant dashboard...' });
      navigate('/restaurant/dashboard');
      return;
    }

    // Priority 4: Default to user dashboard
    setLoading(false);
    toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
    navigate('/dashboard');
  };

  const getTitle = () => {
    if (role === 'admin') return 'Admin Login';
    if (role === 'provider') return 'Provider Login';
    if (role === 'delivery-partner' || role === 'delivery') return 'Delivery Partner Login';
    return 'Welcome Back';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Salad className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-2xl">NutriPlan</span>
          </Link>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {role !== 'admin' && (
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                to={
                  role === 'provider'
                    ? '/provider/register'
                    : role === 'delivery-partner' || role === 'delivery'
                      ? '/delivery-partner/register'
                      : '/register'
                }
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          )}

          <div className="mt-4 flex justify-center gap-4 text-sm">
            {role !== 'user' && (
              <Link to="/login" className="text-muted-foreground hover:text-primary">User Login</Link>
            )}
            {role !== 'provider' && (
              <Link to="/login?role=provider" className="text-muted-foreground hover:text-primary">Provider Login</Link>
            )}
            {role !== 'delivery-partner' && role !== 'delivery' && (
              <Link to="/login?role=delivery-partner" className="text-muted-foreground hover:text-primary">Delivery Partner</Link>
            )}
            {role !== 'admin' && (
              <Link to="/login?role=admin" className="text-muted-foreground hover:text-primary">Admin Login</Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
