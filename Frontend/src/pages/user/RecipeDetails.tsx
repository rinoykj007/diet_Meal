import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dietPlanAPI, mealAPI, subscriptionAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Flame, ChefHat, Check } from 'lucide-react';

export default function RecipeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlanDetails();
    }
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      const planResponse = await dietPlanAPI.getById(id!);
      setPlan(planResponse.data);

      const mealsResponse = await mealAPI.getByDietPlan(id!);
      setMeals(mealsResponse.data || []);
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !plan) return;

    setSubscribing(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (plan.durationDays || 7));

      await subscriptionAPI.create({
        dietPlanId: plan._id,
        providerId: plan.providerId._id || plan.providerId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      toast({ title: 'Subscribed!', description: 'You have successfully subscribed to this plan.' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to subscribe',
        variant: 'destructive'
      });
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </DashboardLayout>
    );
  }

  if (!plan) {
    return (
      <DashboardLayout role="user">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Plan not found</h2>
          <Link to="/meal-plans">
            <Button variant="link">Back to Meal Plans</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <Link to="/meal-plans" className="inline-flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Meal Plans
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <ChefHat className="w-4 h-4" />
                      {plan.providerId?.businessName || 'Provider'}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{plan.durationDays} days</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {plan.description || 'A nutritious meal plan designed for your health goals.'}
                </p>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span>{plan.caloriesPerDay || 2000} cal/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{plan.durationDays} days duration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meals Included */}
            <Card>
              <CardHeader>
                <CardTitle>Meals Included</CardTitle>
                <CardDescription>Sample meals from this plan</CardDescription>
              </CardHeader>
              <CardContent>
                {meals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Meal details coming soon
                  </p>
                ) : (
                  <div className="space-y-4">
                    {meals.map(meal => (
                      <div key={meal._id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <ChefHat className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{meal.name}</h4>
                            <Badge variant="outline" className="capitalize">{meal.mealType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{meal.calories} cal</span>
                            <span>{meal.protein}g protein</span>
                            <span>{meal.carbs}g carbs</span>
                            <span>{meal.fat}g fat</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subscribe Card */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Subscribe to this Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/plan</span>
                </div>

                <div className="space-y-2">
                  {[
                    'AI-optimized meal schedule',
                    'Fresh daily delivery',
                    'Nutritional tracking',
                    'Flexible modifications',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={subscribing}
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
