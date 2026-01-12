import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Salad,
  CalendarDays,
  TrendingUp,
  ArrowRight,
  Clock,
  Flame,
  UtensilsCrossed,
} from "lucide-react";
import { aiDietAPI, orderAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Meal {
  mealType: string;
  name: string;
  description: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  ingredients: string[];
  instructions: string;
}

interface TodayMeal {
  time: string;
  meal: string;
  calories: number;
  mealType: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    activePlans: 0,
    ordersThisMonth: 0,
    caloriesTracked: 0,
  });
  const [todaysMeals, setTodaysMeals] = useState<TodayMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [latestRecommendationId, setLatestRecommendationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchStats(), fetchTodaysMeals()]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch AI recommendations count for "Active Meal Plans"
      const aiResponse = await aiDietAPI.getMyRecommendations({ limit: 100 });
      const activeAIPlans = aiResponse.data.data?.length || 0;

      // Fetch orders this month
      const ordersResponse = await orderAPI.getMyOrders({
        orderType: "diet-food",
      });
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const ordersThisMonth =
        ordersResponse.data.data?.filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          );
        }).length || 0;

      setStats({
        activePlans: activeAIPlans,
        ordersThisMonth,
        caloriesTracked: 0, // Will be calculated from today's meals
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        activePlans: 0,
        ordersThisMonth: 0,
        caloriesTracked: 0,
      });
    }
  };

  const getCurrentDayIndex = () => {
    // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDay = new Date().getDay();
    // Convert to match weeklyPlan array (0 = Monday)
    return currentDay === 0 ? 6 : currentDay - 1;
  };

  const fetchTodaysMeals = async () => {
    try {
      // Fetch latest AI recommendation
      const response = await aiDietAPI.getMyRecommendations({
        limit: 1,
        page: 1,
      });

      if (response.data.data && response.data.data.length > 0) {
        const latestRecommendation = response.data.data[0];
        setLatestRecommendationId(latestRecommendation._id);

        const weeklyPlan = latestRecommendation.recommendation.weeklyPlan;

        if (weeklyPlan && weeklyPlan.length > 0) {
          const dayIndex = getCurrentDayIndex();

          const todayPlan = weeklyPlan[dayIndex];

          if (todayPlan && todayPlan.meals) {
            // Map meals to display format with appropriate times
            const mealTimes: { [key: string]: string } = {
              breakfast: "8:00 AM",
              lunch: "12:30 PM",
              dinner: "7:00 PM",
              snack: "3:00 PM",
            };

            const formattedMeals = todayPlan.meals.map((meal: Meal) => ({
              time: mealTimes[meal.mealType.toLowerCase()] || "12:00 PM",
              meal: meal.name,
              calories: meal.calories,
              mealType: meal.mealType,
            }));

            // Sort meals by time
            formattedMeals.sort((a, b) => {
              const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
              const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
              return timeA - timeB;
            });

            setTodaysMeals(formattedMeals);

            // Calculate total calories for today
            const totalCalories = formattedMeals.reduce(
              (sum, meal) => sum + meal.calories,
              0
            );
            setStats((prev) => ({ ...prev, caloriesTracked: totalCalories }));
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching today's meals:", error);
      // Don't show error toast, just keep empty state
      setTodaysMeals([]);
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold">
              Welcome back, {user?.fullName || "there"}! 
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your nutrition journey
            </p>
          </div>
          <Link to="/ai-diet">
            <Button>
              Get Diet Recipe Recommendations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Meal Plans
              </CardTitle>
              <Salad className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePlans}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Subscriptions running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Orders This Month
              </CardTitle>
              <CalendarDays className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Meals delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Calories
              </CardTitle>
              <Flame className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.caloriesTracked}</div>
              <p className="text-xs text-muted-foreground mt-1">of 2000 goal</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Today's Meals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Meals</CardTitle>
              <CardDescription>Your scheduled meals for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-pulse">Loading your meals...</div>
                </div>
              ) : todaysMeals.length > 0 ? (
                <>
                  <div className="space-y-3 ">
                    {todaysMeals.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{item.time}</span>
                          </div>
                          <span className="font-medium">{item.meal}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.calories} cal
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to={
                      latestRecommendationId
                        ? `/meal-plan/${latestRecommendationId}/day/${getCurrentDayIndex()}`
                        : "/ai-diet"
                    }
                  >
                    <Button variant="outline" className="w-full mt-3">
                      View Full Plan
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <Salad className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">
                    No meal plan generated yet
                  </p>
                  <Link to="/ai-diet">
                    <Button className="w-full">
                      Get AI Recommendations
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks at your fingertips</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link to="/diet-restaurants">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-2"
                >
                  <UtensilsCrossed className="w-5 h-5" />
                  <span>Order Diet Food</span>
                </Button>
              </Link>
              <Link to="/ai-diet">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>AI Diet</span>
                </Button>
              </Link>
              <Link to="/meal-plans">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-2"
                >
                  <Salad className="w-5 h-5" />
                  <span>Meal Plans</span>
                </Button>
              </Link>
              <Link to="/orders">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-2"
                >
                  <CalendarDays className="w-5 h-5" />
                  <span>Order History</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
