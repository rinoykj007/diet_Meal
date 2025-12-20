import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Truck, ArrowLeft, Loader2 } from 'lucide-react';

export default function DeliveryPartnerLogin() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await authAPI.login(formData.email, formData.password);

            const userData = response.data.data;

            // Check if user has delivery-partner role
            if (!userData.user.roles.includes('delivery-partner')) {
                setLoading(false);
                toast({
                    title: 'Access Denied',
                    description: 'This account is not registered as a delivery partner',
                    variant: 'destructive',
                });
                return;
            }

            // Manually store token and user data
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userData.user));

            toast({
                title: 'Welcome back!',
                description: `Logged in as ${userData.user.fullName}`,
            });

            // Navigate to delivery partner dashboard
            navigate('/delivery-partner/dashboard');
        } catch (error: any) {
            setLoading(false);
            toast({
                title: 'Login Failed',
                description: error.response?.data?.message || 'Invalid credentials',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/select-role')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Role Selection
                </Button>

                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <Truck className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Delivery Partner Login</CardTitle>
                        <CardDescription>
                            Sign in to manage your deliveries and earn money
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="mike.delivery@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="text-right">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link
                                    to="/delivery-partner/register"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Become a Delivery Partner
                                </Link>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-xs text-center text-muted-foreground mb-2">
                                    Login as different role:
                                </p>
                                <div className="flex flex-wrap justify-center gap-2 text-xs">
                                    <Link to="/login" className="text-primary hover:underline">
                                        User Login
                                    </Link>
                                    <span className="text-muted-foreground">•</span>
                                    <Link to="/provider/login" className="text-primary hover:underline">
                                        Restaurant Login
                                    </Link>
                                    <span className="text-muted-foreground">•</span>
                                    <Link to="/admin/login" className="text-primary hover:underline">
                                        Admin Login
                                    </Link>
                                </div>
                            </div>
                        </form>

                        {/* Test Credentials */}
                        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                            <p className="font-semibold text-blue-900 mb-1">Test Credentials:</p>
                            <p className="text-blue-800">Email: mike.delivery@example.com</p>
                            <p className="text-blue-800">Password: provider123</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
