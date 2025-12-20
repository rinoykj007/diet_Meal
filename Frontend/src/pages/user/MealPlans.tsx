import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dietPlanAPI, aiDietAPI } from '@/lib/api';
import { Salad, Clock, Flame, ChefHat, Sparkles, Calendar, ArrowRight } from 'lucide-react';

export default function MealPlans() {
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPlans();
  }, []);

  const fetchAllPlans = async () => {
    try {
      // Fetch both provider plans and AI recommendations
      const [providerResponse, aiResponse] = await Promise.all([
        dietPlanAPI.getAll().catch(() => ({ data: [] })),
        aiDietAPI.getMyRecommendations({ limit: 10 }).catch(() => ({ data: { data: [] } }))
      ]);

      setDietPlans(providerResponse.data || []);
      setAiRecommendations(aiResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold">Meal Plans</h1>
            <p className="text-muted-foreground mt-1">Browse your AI-generated plans and provider meal plans</p>
          </div>
          <Link to="/ai-diet">
            <Button>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Plan
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-32 bg-muted" />
                <CardContent className="space-y-3 pt-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* AI Generated Plans Section */}
            {aiRecommendations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Your AI-Generated Plans</h2>
                  <Badge variant="secondary">{aiRecommendations.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiRecommendations.map(recommendation => {
                    const totalCalories = recommendation.recommendation.weeklyPlan?.[0]?.meals?.reduce(
                      (sum: number, meal: any) => sum + (meal.calories || 0), 0
                    ) || 0;

                    return (
                      <Card key={recommendation._id} className="hover:shadow-lg transition-shadow border-primary/20">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                AI Personalized Plan
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {new Date(recommendation.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </CardDescription>
                            </div>
                            <Badge variant="default">7 days</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {recommendation.recommendation.summary || 'Your personalized weekly meal plan powered by AI'}
                          </p>

                          <div className="space-y-2 text-sm">
                            {recommendation.preferences.healthGoals && (
                              <div className="flex items-start gap-2">
                                <span className="text-muted-foreground">Goals:</span>
                                <span className="font-medium">
                                  {Array.isArray(recommendation.preferences.healthGoals)
                                    ? recommendation.preferences.healthGoals.join(', ')
                                    : recommendation.preferences.healthGoals}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Flame className="w-4 h-4" />
                              ~{totalCalories} cal/day
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              7 days
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Free
                            </Badge>
                            <Link to={`/meal-plan/${recommendation._id}`}>
                              <Button>
                                View Details
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Provider Plans Section */}
            {dietPlans.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Provider Meal Plans</h2>
                  <Badge variant="secondary">{dietPlans.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dietPlans.map(plan => (
                    <Card key={plan._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <ChefHat className="w-3 h-3" />
                              {plan.providerId?.businessName || 'Unknown Provider'}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">{plan.durationDays} days</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {plan.description || 'A nutritious meal plan designed for your health goals.'}
                        </p>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Flame className="w-4 h-4" />
                            {plan.caloriesPerDay || '~2000'} cal/day
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {plan.durationDays} days
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <span className="text-2xl font-bold">${plan.price}</span>
                            <span className="text-muted-foreground text-sm">/plan</span>
                          </div>
                          <Link to={`/recipe/${plan._id}`}>
                            <Button>View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {aiRecommendations.length === 0 && dietPlans.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No meal plans yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by generating your first AI-powered meal plan
                  </p>
                  <Link to="/ai-diet">
                    <Button>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Meal Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
