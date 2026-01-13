import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Loader2,
  ChefHat,
  ShoppingCart,
  Lightbulb,
  Calendar,
} from "lucide-react";
import { aiDietAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

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

export default function AIDiet() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );
  const [selectedDay, setSelectedDay] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    healthGoals: "",
    dietaryRestrictions: "",
    allergies: "",
    preferredCuisines: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    calorieTarget: "",
    mealsPerDay: "3",
    activityLevel: "moderate",
    budgetRange: "Medium",
    additionalNotes: "",
  });

  // Calculate BMR and Daily Calorie Target using Mifflin-St Jeor Equation
  const calculateDailyCalories = () => {
    const age = parseInt(formData.age);
    const weight = parseFloat(formData.weight); // in kg
    const height = parseFloat(formData.height); // in cm
    const gender = formData.gender;
    const healthGoal = formData.healthGoals;

    if (!age || !weight || !height || !gender) {
      return null;
    }

    let bmr = 0;

    // Calculate BMR using Mifflin-St Jeor Equation (more modern & accurate)
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === "female") {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity Factor multipliers
    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const activityFactor = activityFactors[formData.activityLevel] || 1.55;

    // Calculate TDEE (Total Daily Energy Expenditure)
    let tdee = Math.round(bmr * activityFactor);

    // Adjust calories based on health goal
    let dailyCalories = tdee;
    if (healthGoal === "Weight Loss") {
      dailyCalories = tdee - 500; // 🔻 Weight loss: TDEE - 500 kcal
    } else if (
      healthGoal === "Weight Gain" ||
      healthGoal === "Weight Gain (Muscle Gain)"
    ) {
      dailyCalories = tdee + 400; // 🔺 Weight gain: TDEE + 400 kcal (middle of 300-500 range)
    }
    // For "Weight Maintenance", dailyCalories remains as TDEE (±100 kcal is natural variance)

    return Math.round(dailyCalories);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.healthGoals.trim()) {
      toast({
        title: "Error",
        description: "Please enter your health goals",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setProgressMessage("Starting...");
    setRecommendation(null); // Clear previous recommendation

    try {
      // Use calculated calories if not manually entered
      const finalCalorieTarget = formData.calorieTarget
        ? parseInt(formData.calorieTarget)
        : calculateDailyCalories() || undefined;

      const preferences = {
        healthGoals: formData.healthGoals.split(",").map((g) => g.trim()),
        dietaryRestrictions: formData.dietaryRestrictions
          ? formData.dietaryRestrictions.split(",").map((d) => d.trim())
          : [],
        allergies: formData.allergies
          ? formData.allergies.split(",").map((a) => a.trim())
          : [],
        preferredCuisines: formData.preferredCuisines
          ? formData.preferredCuisines.split(",").map((c) => c.trim())
          : [],
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        calorieTarget: finalCalorieTarget,
        mealsPerDay: parseInt(formData.mealsPerDay),
        activityLevel: formData.activityLevel as any,
        budgetRange: formData.budgetRange,
        additionalNotes: formData.additionalNotes || undefined,
      };

      const response: any = await aiDietAPI.generateRecommendation(
        preferences,
        (event) => {
          // Handle streaming progress updates
          if (event.type === "status") {
            setProgress(event.data.progress || 0);
            setProgressMessage(event.data.message || "Processing...");
          }
          // Content streaming removed - using friendly messages instead
        }
      );

      // Display the final formatted result
      setRecommendation(response.data.data.recommendation);
      setSelectedDay(0);
      setProgress(100);
      setProgressMessage("Complete!");

      toast({
        title: "Success!",
        description: "Your personalized meal plan has been generated",
      });
    } catch (error: any) {
      console.error("Error generating recommendation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate meal plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Diet Recipe
          </h1>
        </div>

        {/* Centered Loading Modal with Progress */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 shadow-2xl">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <CircularProgress size={60} thickness={4} />
                </div>
                <CardTitle className="text-xl">
                  Generating Your Meal Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Percentage */}
                  <div className="text-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {progress}%
                    </span>
                  </div>

                  {/* MUI Linear Progress Bar */}
                  <Box sx={{ width: "100%" }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#DBEAFE",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#2563EB",
                          borderRadius: 6,
                        },
                      }}
                    />
                  </Box>

                  {/* User-friendly progress messages - Centered */}
                  <div className="text-center py-4">
                    <div className="flex justify-center mb-3">
                      <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
                    </div>
                    <p className="font-semibold text-blue-900 text-lg mb-2">
                      {progress < 20 && "🔍 Analyzing your health profile..."}
                      {progress >= 20 &&
                        progress < 35 &&
                        " Calculating your TDEE and calorie needs..."}
                      {progress >= 35 &&
                        progress < 50 &&
                        " AI is designing your personalized meal plan..."}
                      {progress >= 50 &&
                        progress < 65 &&
                        " Creating breakfast, lunch, and dinner recipes..."}
                      {progress >= 65 &&
                        progress < 80 &&
                        "Preparing your weekly shopping list..."}
                      {progress >= 80 &&
                        progress < 95 &&
                        "Finalizing tips and nutritional analysis..."}
                      {progress >= 95 && "✅ Your meal plan is ready!"}
                    </p>
                    <p className="text-sm text-blue-600">
                      This may take 30-60 seconds...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!recommendation && !isGenerating && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Tell Us About Your Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Personal Information Section */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="e.g., 25"
                        value={formData.age}
                        onChange={(e) =>
                          handleInputChange("age", e.target.value)
                        }
                        required
                        min="1"
                        max="120"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          handleInputChange("gender", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm) *</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="e.g., 170"
                        value={formData.height}
                        onChange={(e) =>
                          handleInputChange("height", e.target.value)
                        }
                        required
                        min="50"
                        max="300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 70"
                        value={formData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        required
                        min="20"
                        max="500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="healthGoals">Health Goals *</Label>
                    <Select
                      value={formData.healthGoals}
                      onValueChange={(value) =>
                        handleInputChange("healthGoals", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your health goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                        <SelectItem value="Weight Gain">
                          Weight Gain (Muscle Gain)
                        </SelectItem>
                        <SelectItem value="Weight Maintenance">
                          Weight Maintenance
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Separate multiple goals with commas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dietaryRestrictions">
                      Dietary Restrictions
                    </Label>
                    <Input
                      id="dietaryRestrictions"
                      placeholder="e.g., Vegetarian, Vegan, Keto"
                      value={formData.dietaryRestrictions}
                      onChange={(e) =>
                        handleInputChange("dietaryRestrictions", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      placeholder="e.g., Nuts, Dairy, Gluten"
                      value={formData.allergies}
                      onChange={(e) =>
                        handleInputChange("allergies", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredCuisines">
                      Preferred Cuisines
                    </Label>
                    <Input
                      id="preferredCuisines"
                      placeholder="e.g., Italian, Asian, Mediterranean"
                      value={formData.preferredCuisines}
                      onChange={(e) =>
                        handleInputChange("preferredCuisines", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calorieTarget">Daily Calorie Target</Label>
                    <div className="relative">
                      <Input
                        id="calorieTarget"
                        type="number"
                        placeholder="Auto-calculated or enter manually"
                        value={
                          formData.calorieTarget ||
                          calculateDailyCalories() ||
                          ""
                        }
                        onChange={(e) =>
                          handleInputChange("calorieTarget", e.target.value)
                        }
                        className={
                          calculateDailyCalories() ? "bg-green-50" : ""
                        }
                      />
                      {calculateDailyCalories() && !formData.calorieTarget && (
                        <div className="absolute right-2 top-2 text-xs text-green-600 font-medium">
                          Auto-calculated
                        </div>
                      )}
                    </div>
                    {!calculateDailyCalories() && (
                      <p className="text-xs text-muted-foreground">
                        Fill in age, gender, height, and weight for
                        auto-calculation
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mealsPerDay">Meals Per Day</Label>
                    <Select
                      value={formData.mealsPerDay}
                      onValueChange={(value) =>
                        handleInputChange("mealsPerDay", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 meals</SelectItem>
                        <SelectItem value="3">3 meals</SelectItem>
                        <SelectItem value="4">4 meals</SelectItem>
                        <SelectItem value="5">5 meals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select
                      value={formData.activityLevel}
                      onValueChange={(value) =>
                        handleInputChange("activityLevel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light Activity</SelectItem>
                        <SelectItem value="moderate">
                          Moderate Activity
                        </SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetRange">Budget Range</Label>
                    <Select
                      value={formData.budgetRange}
                      onValueChange={(value) =>
                        handleInputChange("budgetRange", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any other preferences or requirements..."
                    value={formData.additionalNotes}
                    onChange={(e) =>
                      handleInputChange("additionalNotes", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Your Meal Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Meal Plan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {recommendation && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Your Personalized Meal Plan
              </h2>
              <Button variant="outline" onClick={() => setRecommendation(null)}>
                Create New Plan
              </Button>
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
                <p className="text-muted-foreground">
                  {recommendation.summary}
                </p>
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
                <div className="space-y-4">
                  {/* Day selector */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {recommendation.weeklyPlan.map((dayPlan, index) => (
                      <Button
                        key={index}
                        variant={selectedDay === index ? "default" : "outline"}
                        onClick={() => setSelectedDay(index)}
                        className="whitespace-nowrap"
                      >
                        {dayPlan.day}
                      </Button>
                    ))}
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
                <p className="text-muted-foreground">
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
                  {(() => {
                    // Split all items by commas and remove duplicates
                    const allItems = recommendation.shoppingList.join(', ').split(',');
                    const uniqueItems = [...new Set(allItems.map(item => item.trim()).filter(item => item))];

                    return uniqueItems.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {item}
                        </span>
                      </li>
                    ));
                  })()}
                </ul>
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
        )}
      </div>
    </DashboardLayout>
  );
}
