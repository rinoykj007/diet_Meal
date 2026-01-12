import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { aiDietAPI, shoppingListAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import RestaurantSelectionModal from "@/components/modals/RestaurantSelectionModal";
import CustomRecipeOrderModal from "@/components/modals/CustomRecipeOrderModal";
import ShoppingRequestModal from "@/components/modals/ShoppingRequestModal";
import {
  Sparkles,
  Calendar,
  ChefHat,
  Flame,
  ShoppingCart,
  Lightbulb,
  ArrowLeft,
  Loader2,
  Store,
  User,
  CheckCircle,
  Clock,
  Package,
} from "lucide-react";

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

interface DayPlan {
  day: string;
  meals: Meal[];
}

interface Recommendation {
  summary: string;
  weeklyPlan: DayPlan[];
  nutritionalAnalysis: string;
  shoppingList: string[];
  tips: string[];
}

interface DietPlanData {
  _id: string;
  userId: string;
  preferences: any;
  recommendation: Recommendation;
  createdAt: string;
}

export default function WeeklyDietPlan() {
  const { id, day } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<DietPlanData | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  // Custom Recipe Order Modal State
  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  // Shopping Request Modal State
  const [shoppingRequestModalOpen, setShoppingRequestModalOpen] =
    useState(false);

  // Shopping Request Status State
  const [shoppingRequest, setShoppingRequest] = useState<any>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  useEffect(() => {
    if (planData) {
      fetchShoppingRequest();
    }
  }, [planData]);

  useEffect(() => {
    // If day parameter is provided, set it as the selected day
    if (day && planData) {
      const dayIndex = parseInt(day);
      if (
        !isNaN(dayIndex) &&
        dayIndex >= 0 &&
        dayIndex < (planData.recommendation.weeklyPlan?.length || 0)
      ) {
        setSelectedDay(dayIndex);
      }
    }
  }, [day, planData]);

  const fetchPlanDetails = async () => {
    if (!id) {
      navigate("/meal-plans");
      return;
    }

    try {
      setLoading(true);
      const response = await aiDietAPI.getMyRecommendations({ limit: 100 });
      const plans = response.data.data;

      // Find the plan with the matching ID
      const plan = plans.find((p: DietPlanData) => p._id === id);

      if (!plan) {
        toast({
          title: "Error",
          description: "Meal plan not found",
          variant: "destructive",
        });
        navigate("/meal-plans");
        return;
      }

      setPlanData(plan);
    } catch (error: any) {
      console.error("Error fetching plan details:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load meal plan",
        variant: "destructive",
      });
      navigate("/meal-plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchShoppingRequest = async () => {
    if (!planData) return;

    try {
      setLoadingRequest(true);
      const response = await shoppingListAPI.getMyRequests();
      const requests = response.data.data || [];

      // Find the request for this meal plan that's not cancelled or delivered
      const activeRequest = requests.find(
        (req: any) =>
          req.mealPlanId === planData._id && req.status !== "cancelled"
      );

      setShoppingRequest(activeRequest || null);
    } catch (error) {
      console.error("Error fetching shopping request:", error);
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleOrderFromRestaurant = (meal: Meal) => {
    setSelectedMeal(meal);
    setRestaurantModalOpen(true);
  };

  const handleRestaurantSelected = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setOrderModalOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!planData || !planData.recommendation) {
    return null;
  }

  const { recommendation } = planData;
  const totalDailyCalories =
    recommendation.weeklyPlan[selectedDay]?.meals?.reduce(
      (sum, meal) => sum + (meal.calories || 0),
      0
    ) || 0;

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/meal-plans")}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Meal Plans
            </Button>
            <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              AI Personalized Plan
            </h1>
            <p className="text-muted-foreground mt-1">
              {new Date(planData.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <Badge variant="default" className="text-lg px-4 py-2">
            7 days
          </Badge>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Plan Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{recommendation.summary}</p>
            {planData.preferences.healthGoals && (
              <div className="mt-4 flex items-start gap-2">
                <span className="font-semibold">Goals:</span>
                <span className="text-muted-foreground">
                  {Array.isArray(planData.preferences.healthGoals)
                    ? planData.preferences.healthGoals.join(", ")
                    : planData.preferences.healthGoals}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Weekly Meal Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Day selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {recommendation.weeklyPlan.map((dayPlan, index) => (
                  <Button
                    key={index}
                    variant={selectedDay === index ? "default" : "outline"}
                    onClick={() => setSelectedDay(index)}
                    className="whitespace-nowrap flex-shrink-0"
                  >
                    {dayPlan.day}
                  </Button>
                ))}
              </div>

              {/* Daily calories summary */}
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <Flame className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Total Daily Calories</p>
                  <p className="text-2xl font-bold">{totalDailyCalories} cal</p>
                </div>
              </div>

              {/* Meals for selected day - Modern Compact Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendation.weeklyPlan[selectedDay]?.meals.map(
                  (meal, index) => (
                    <Card
                      key={index}
                      className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Meal Header - Compact */}
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 border-b">
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-primary">
                            {meal.mealType}
                          </span>
                        </div>
                        <h3 className="font-bold text-base mt-0.5">
                          {meal.name}
                        </h3>
                      </div>

                      {/* Card Content - Grows to fill space */}
                      <div className="p-4 space-y-2.5 flex-grow flex flex-col">
                        {/* Description */}
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {meal.description}
                        </p>

                        {/* Nutrition info - Compact 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-1.5 text-xs bg-gradient-to-br from-muted/50 to-muted/30 p-2.5 rounded-lg">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-[10px] uppercase tracking-wide">
                              Calories
                            </span>
                            <span className="text-xl font-bold text-primary leading-tight">
                              {meal.calories}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-[10px] uppercase tracking-wide">
                              Protein
                            </span>
                            <span className="text-xl font-bold text-primary leading-tight">
                              {meal.macros.protein}g
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-[10px] uppercase tracking-wide">
                              Carbs
                            </span>
                            <span className="text-xl font-bold text-primary leading-tight">
                              {meal.macros.carbs}g
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-[10px] uppercase tracking-wide">
                              Fats
                            </span>
                            <span className="text-xl font-bold text-primary leading-tight">
                              {meal.macros.fats}g
                            </span>
                          </div>
                        </div>

                        {/* Ingredients - Compact */}
                        <div>
                          <p className="font-semibold text-xs mb-1 text-foreground/80">
                            Ingredients
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {meal.ingredients.map((ingredient, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded"
                              >
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Instructions - Compact */}
                        <div className="flex-grow">
                          <p className="font-semibold text-xs mb-1 text-foreground/80">
                            Instructions
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                            {meal.instructions}
                          </p>
                        </div>
                      </div>

                      {/* Order Button - Separate section at bottom */}
                      <div className="p-4 pt-0">
                        <Button
                          onClick={() => handleOrderFromRestaurant(meal)}
                          className="w-full h-9 text-sm"
                          size="sm"
                        >
                          <Store className="w-3.5 h-3.5 mr-1.5" />
                          Order from Restaurant
                        </Button>
                      </div>
                    </Card>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutritional Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              Nutritional Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {recommendation.nutritionalAnalysis}
            </p>
          </CardContent>
        </Card>

        {/* Shopping List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Shopping List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {recommendation.shoppingList.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>

            {/* Shopping Request Status & Button */}
            <div className="mt-6 pt-4 border-t">
              {loadingRequest ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Checking status...
                  </p>
                </div>
              ) : shoppingRequest ? (
                <div className="space-y-3">
                  {/* Pending Status */}
                  {shoppingRequest.status === "pending" && (
                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-yellow-900 mb-1">
                            Request Sent - Waiting for Delivery Partner
                          </p>
                          <p className="text-sm text-yellow-800">
                            Your shopping list request is pending. A delivery
                            partner will accept it soon!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Accepted Status */}
                  {shoppingRequest.status === "accepted" &&
                    shoppingRequest.deliveryPartnerId && (
                      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold text-blue-900 mb-1">
                              Delivery Partner Assigned!
                            </p>
                            <p className="text-sm text-blue-800 mb-2">
                              <strong>
                                {shoppingRequest.deliveryPartnerId.fullName}
                              </strong>{" "}
                              has accepted your request and will start shopping
                              soon.
                            </p>
                            <p className="text-xs text-blue-700">
                              Contact: {shoppingRequest.deliveryPartnerId.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* In-Progress Status */}
                  {shoppingRequest.status === "in-progress" &&
                    shoppingRequest.deliveryPartnerId && (
                      <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0 animate-pulse" />
                          <div className="flex-1">
                            <p className="font-semibold text-purple-900 mb-1">
                              Shopping in Progress
                            </p>
                            <p className="text-sm text-purple-800 mb-2">
                              <strong>
                                {shoppingRequest.deliveryPartnerId.fullName}
                              </strong>{" "}
                              is currently shopping for your items!
                            </p>
                            <p className="text-xs text-purple-700">
                              Contact: {shoppingRequest.deliveryPartnerId.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Delivered Status */}
                  {shoppingRequest.status === "delivered" && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-green-900 mb-1">
                            Items Delivered!
                          </p>
                          <p className="text-sm text-green-800 mb-2">
                            Your shopping items have been successfully
                            delivered.
                          </p>
                          {shoppingRequest.finalCost && (
                            <div className="text-sm text-green-800 space-y-1 mt-2 p-2 bg-green-100 rounded">
                              <p>
                                Grocery Cost: $
                                {shoppingRequest.finalCost.toFixed(2)}
                              </p>
                              <p>
                                Delivery Fee: $
                                {shoppingRequest.deliveryFee.toFixed(2)}
                              </p>
                              <p className="font-bold border-t border-green-300 pt-1 mt-1">
                                Total Paid: $
                                {(
                                  shoppingRequest.finalCost +
                                  shoppingRequest.deliveryFee
                                ).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Refresh Button */}
                  <Button
                    onClick={fetchShoppingRequest}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Refresh Status
                  </Button>
                </div>
              ) : (
                <div>
                  <Button
                    onClick={() => setShoppingRequestModalOpen(true)}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy All Items - Get Delivered
                  </Button>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Fixed delivery fee: $10.00 • Cash on delivery
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Tips & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendation.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Custom Recipe Order Modals */}
      <RestaurantSelectionModal
        open={restaurantModalOpen}
        onClose={() => setRestaurantModalOpen(false)}
        onSelectRestaurant={handleRestaurantSelected}
      />

      <CustomRecipeOrderModal
        open={orderModalOpen}
        onClose={() => {
          setOrderModalOpen(false);
          setSelectedMeal(null);
          setSelectedRestaurant(null);
        }}
        recipe={
          selectedMeal
            ? {
                recipeName: selectedMeal.name,
                description: selectedMeal.description,
                ingredients: selectedMeal.ingredients,
                instructions: selectedMeal.instructions,
                calories: selectedMeal.calories,
                macros: selectedMeal.macros,
                mealType: selectedMeal.mealType,
              }
            : null
        }
        restaurant={selectedRestaurant}
      />

      {/* Shopping Request Modal */}
      {planData && (
        <ShoppingRequestModal
          open={shoppingRequestModalOpen}
          onClose={() => {
            setShoppingRequestModalOpen(false);
            fetchShoppingRequest(); // Refresh status after modal closes
          }}
          mealPlanId={planData._id}
          shoppingList={planData.recommendation.shoppingList}
        />
      )}
    </DashboardLayout>
  );
}
