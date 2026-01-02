import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { authAPI, restaurantAPI } from '@/lib/api';
import { Store, Loader2, CheckCircle2 } from 'lucide-react';

const DIET_TYPES = [
  { id: 'keto', label: 'Keto' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'diabetic', label: 'Diabetic' },
  { id: 'low-carb', label: 'Low-Carb' },
  { id: 'high-protein', label: 'High-Protein' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'mediterranean', label: 'Mediterranean' },
];

export default function ProviderRegister() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1: User Account
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Step 2: Restaurant Details
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    dietTypes: [] as string[],
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleRestaurantInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRestaurantForm({ ...restaurantForm, [e.target.name]: e.target.value });
  };

  const handleDietTypeToggle = (dietType: string) => {
    setRestaurantForm({
      ...restaurantForm,
      dietTypes: restaurantForm.dietTypes.includes(dietType)
        ? restaurantForm.dietTypes.filter((t) => t !== dietType)
        : [...restaurantForm.dietTypes, dietType],
    });
  };

  const validateUserForm = () => {
    if (!userForm.fullName || !userForm.email || !userForm.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return false;
    }

    if (userForm.password !== userForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return false;
    }

    if (userForm.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const validateRestaurantForm = () => {
    if (!restaurantForm.name) {
      toast({
        title: 'Validation Error',
        description: 'Restaurant name is required',
        variant: 'destructive',
      });
      return false;
    }

    if (restaurantForm.dietTypes.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one diet type',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    setLoading(true);
    try {
      // Register user
      const response = await authAPI.register({
        email: userForm.email,
        password: userForm.password,
        fullName: userForm.fullName,
        phone: userForm.phone,
        roles: ["user", "restaurant"],
      });

      // Save token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      toast({
        title: 'Account Created!',
        description: 'Now let\'s set up your restaurant',
      });

      setStep(2);
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.message || 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRestaurantForm()) return;

    setLoading(true);
    try {
      // Create restaurant
      await restaurantAPI.create({
        name: restaurantForm.name,
        description: restaurantForm.description,
        dietTypes: restaurantForm.dietTypes,
        phone: restaurantForm.phone,
        email: restaurantForm.email,
        address: {
          street: restaurantForm.street,
          city: restaurantForm.city,
          state: restaurantForm.state,
          zipCode: restaurantForm.zipCode,
          country: restaurantForm.country,
        },
      });

      toast({
        title: 'Restaurant Registered!',
        description: 'Your restaurant is pending admin approval',
      });

      setStep(3);
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.message || 'Failed to register restaurant',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: User Registration
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-2xl">NutriPlan</span>
            </div>
            <CardTitle className="text-2xl">Register Your Restaurant</CardTitle>
            <CardDescription>Step 1 of 2: Create Your Account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={userForm.fullName}
                  onChange={handleUserInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={userForm.email}
                  onChange={handleUserInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={userForm.phone}
                  onChange={handleUserInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={userForm.password}
                  onChange={handleUserInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={userForm.confirmPassword}
                  onChange={handleUserInputChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Continue to Restaurant Details'
                )}
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
                  const params = new URLSearchParams();
                  params.append("mode", "register");
                  params.append("state", "restaurant");

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
                Sign up with Google
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Restaurant Registration
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Restaurant Details</CardTitle>
            <CardDescription>Step 2 of 2: Tell us about your restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep2Submit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Healthy Delights Kitchen"
                    value={restaurantForm.name}
                    onChange={handleRestaurantInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tell customers about your restaurant..."
                    value={restaurantForm.description}
                    onChange={handleRestaurantInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantPhone">Restaurant Phone</Label>
                    <Input
                      id="restaurantPhone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={restaurantForm.phone}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurantEmail">Restaurant Email</Label>
                    <Input
                      id="restaurantEmail"
                      name="email"
                      type="email"
                      placeholder="contact@restaurant.com"
                      value={restaurantForm.email}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Diet Types */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Diet Types Offered *</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIET_TYPES.map((diet) => (
                    <div key={diet.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={diet.id}
                        checked={restaurantForm.dietTypes.includes(diet.id)}
                        onCheckedChange={() => handleDietTypeToggle(diet.id)}
                      />
                      <Label
                        htmlFor={diet.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {diet.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Location</h3>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    name="street"
                    placeholder="123 Main Street"
                    value={restaurantForm.street}
                    onChange={handleRestaurantInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="New York"
                      value={restaurantForm.city}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="NY"
                      value={restaurantForm.state}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      placeholder="10001"
                      value={restaurantForm.zipCode}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      placeholder="USA"
                      value={restaurantForm.country}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering Restaurant...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Registration Complete!</CardTitle>
          <CardDescription>Your restaurant is pending approval</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">What happens next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Our admin team will review your restaurant details</li>
              <li>You'll receive an email once approved (usually within 24-48 hours)</li>
              <li>After approval, you can start adding your menu items</li>
              <li>Your restaurant will be visible to customers</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => navigate('/restaurant/dashboard')}
            >
              Go to Restaurant Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              Go to User Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
