import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { restaurantAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Salad, Eye, EyeOff, ChevronDown, User, Store, Truck } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "user";

  // Show error from Google OAuth if present
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast({
        title: "Authentication Failed",
        description: error,
        variant: "destructive",
      });
      // Clean up URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("error");
      navigate(`?${newParams.toString()}`, { replace: true });
    }
  }, [searchParams, toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0])
          fieldErrors[err.path[0] as "email" | "password"] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      setLoading(false);
      toast({
        title: "Login failed",
        description:
          error.message === "Invalid login credentials"
            ? "Invalid email or password. Please try again."
            : error.message,
        variant: "destructive",
      });
      return;
    }

    // Get the updated user from localStorage (set by signIn)
    const userDataStr = localStorage.getItem("user");
    const userData = userDataStr ? JSON.parse(userDataStr) : null;

    // Priority 1: Check if user is admin
    if (userData?.roles?.includes("admin")) {
      setLoading(false);
      toast({
        title: "Welcome back, Admin!",
        description: "Redirecting to admin dashboard...",
      });
      navigate("/admin/dashboard");
      return;
    }

    // Priority 2: Check if user has delivery-partner role
    if (userData?.roles?.includes("delivery-partner")) {
      setLoading(false);
      toast({
        title: "Welcome back!",
        description: "Redirecting to delivery partner dashboard...",
      });
      navigate("/delivery-partner/dashboard");
      return;
    }

    // Priority 3: Check if user has provider role
    if (userData?.roles?.includes("restaurant")) {
      setLoading(false);
      toast({
        title: "Welcome back!",
        description: "Redirecting to restaurant dashboard...",
      });
      navigate("/restaurant/dashboard");
      return;
    }

    // Priority 4: Default to user dashboard
    setLoading(false);
    toast({
      title: "Welcome back!",
      description: "You have successfully logged in.",
    });
    navigate("/dashboard");
  };

  const getTitle = () => {
    if (role === "admin") return "Admin Login";
    if (role === "restaurant") return "Restaurant Login";
    if (role === "delivery-partner" || role === "delivery")
      return "Delivery Partner Login";
    return "Welcome Back";
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
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
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
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                const state = role !== "user" ? role : undefined;
                const params = new URLSearchParams();
                params.append("mode", "login");
                if (state) params.append("state", state);

                window.location.href = `${
                  import.meta.env.VITE_API_URL
                }/auth/google?${params.toString()}`;
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>

          {role !== "admin" && (
            <div className="mt-6 text-center">
              <span className="text-muted-foreground text-sm">
                Don't have an account?{" "}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="link" size="sm" className="gap-1 p-0 h-auto font-medium">
                    Sign up
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/register" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      User Sign Up
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/provider/register" className="flex items-center gap-2 cursor-pointer">
                      <Store className="h-4 w-4" />
                      Restaurant Sign Up
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/delivery-partner/register" className="flex items-center gap-2 cursor-pointer">
                      <Truck className="h-4 w-4" />
                      Delivery Partner Sign Up
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="mt-4 flex justify-center gap-4 text-sm">
            {role !== "user" && (
              <Link
                to="/login"
                className="text-muted-foreground hover:text-primary"
              >
                User Login
              </Link>
            )}
            {role !== "restaurant" && (
              <Link
                to="/login?role=restaurant"
                className="text-muted-foreground hover:text-primary"
              >
                Restaurant Login
              </Link>
            )}
            {role !== "delivery-partner" && role !== "delivery" && (
              <Link
                to="/login?role=delivery-partner"
                className="text-muted-foreground hover:text-primary"
              >
                Delivery Partner
              </Link>
            )}
            {role !== "admin" && (
              <Link
                to="/login?role=admin"
                className="text-muted-foreground hover:text-primary"
              >
                Admin Login
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
