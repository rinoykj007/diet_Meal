import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI, dietFoodAPI, orderAPI, aiDietAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, MapPin, Phone, Mail, Star, ShoppingCart, Plus, Minus, Trash2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DietFood {
  _id: string;
  name: string;
  description: string;
  dietType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  image?: string;
  servingSize?: string;
  isAvailable: boolean;
  personalized?: {
    calorieMatch: boolean;
    macroScore: number;
    matchReasons: string[];
    badges: string[];
  };
}

interface UserPreferences {
  hasPreferences: boolean;
  bmr?: number;
  tdee?: number;
  mealBudgets?: {
    breakfast: { target: number; min: number; max: number };
    lunch: { target: number; min: number; max: number };
    dinner: { target: number; min: number; max: number };
    snacks: { target: number; min: number; max: number };
  };
  dietaryRestrictions?: string[];
  allergies?: string[];
  healthGoals?: string[];
}

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  dietTypes: string[];
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  image?: string;
  rating: number;
  totalReviews: number;
}

interface CartItem extends DietFood {
  quantity: number;
}

const RestaurantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dietFoods, setDietFoods] = useState<DietFood[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDietType, setSelectedDietType] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('lunch');

  // Delivery form
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  useEffect(() => {
    if (id) {
      fetchRestaurantDetails();
      fetchDietFoods();
    }
  }, [id, selectedDietType, showPersonalized, selectedMealType]);

  const fetchUserPreferences = async () => {
    try {
      const response = await aiDietAPI.getUserPreferences();
      setUserPreferences(response.data.data);

      // Auto-enable personalized mode if user has complete preferences
      if (response.data.data.hasPreferences && response.data.data.tdee) {
        setShowPersonalized(true);
      }
    } catch (error: any) {
      console.log('No user preferences found:', error);
      setUserPreferences({ hasPreferences: false });
    }
  };

  const fetchRestaurantDetails = async () => {
    try {
      const response = await restaurantAPI.getById(id!);
      setRestaurant(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch restaurant details',
        variant: 'destructive',
      });
    }
  };

  const fetchDietFoods = async () => {
    try {
      setLoading(true);
      const params: any = { restaurantId: id };

      if (selectedDietType) {
        params.dietType = selectedDietType;
      }

      // Add personalization parameters
      if (showPersonalized && userPreferences?.hasPreferences) {
        params.personalized = 'true';
        params.mealType = selectedMealType;
      }

      const response = await dietFoodAPI.getAll(params);
      setDietFoods(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch menu items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (food: DietFood) => {
    const existing = cart.find((item) => item._id === food._id);
    if (existing) {
      setCart(cart.map((item) =>
        item._id === food._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...food, quantity: 1 }]);
    }
    toast({
      title: 'Added to cart',
      description: `${food.name} added to cart`,
    });
  };

  const updateQuantity = (foodId: string, change: number) => {
    setCart(cart.map((item) => {
      if (item._id === foodId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (foodId: string) => {
    setCart(cart.filter((item) => item._id !== foodId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalCalories = () => {
    return cart.reduce((total, item) => total + item.calories * item.quantity, 0);
  };

  const getCalorieBudgetStatus = () => {
    if (!userPreferences?.mealBudgets || !showPersonalized) return null;

    const totalCalories = getTotalCalories();
    const mealBudget = userPreferences.mealBudgets[selectedMealType as keyof typeof userPreferences.mealBudgets];

    if (!mealBudget) return null;

    const percentage = (totalCalories / mealBudget.target) * 100;

    if (totalCalories > mealBudget.max) {
      return {
        status: 'over',
        message: `⚠️ Over budget! ${totalCalories} cal exceeds your ${selectedMealType} max (${mealBudget.max} cal)`,
        color: 'bg-red-50 border-red-300 text-red-800',
        percentage
      };
    } else if (totalCalories >= mealBudget.target) {
      return {
        status: 'at-target',
        message: `✓ Target reached! ${totalCalories} cal meets your ${selectedMealType} budget (${mealBudget.target} cal)`,
        color: 'bg-green-50 border-green-300 text-green-800',
        percentage
      };
    } else if (totalCalories >= mealBudget.min) {
      return {
        status: 'in-range',
        message: `✓ In range! ${totalCalories} cal is within your ${selectedMealType} budget (${mealBudget.min}-${mealBudget.max} cal)`,
        color: 'bg-blue-50 border-blue-300 text-blue-800',
        percentage
      };
    } else if (totalCalories > 0) {
      return {
        status: 'under',
        message: `${totalCalories} cal / ${mealBudget.target} cal target`,
        color: 'bg-gray-50 border-gray-300 text-gray-700',
        percentage
      };
    }

    return null;
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state) {
      toast({
        title: 'Error',
        description: 'Please fill in all delivery address fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await orderAPI.create({
        restaurantId: id!,
        items: cart.map((item) => ({
          dietFoodId: item._id,
          quantity: item.quantity,
        })),
        deliveryAddress,
        notes,
      });

      toast({
        title: 'Order placed successfully!',
        description: 'Your order has been placed and will be delivered soon.',
      });

      setCart([]);
      setShowCheckout(false);
      navigate('/orders');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDietTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      keto: 'bg-purple-100 text-purple-800',
      vegan: 'bg-green-100 text-green-800',
      vegetarian: 'bg-lime-100 text-lime-800',
      diabetic: 'bg-blue-100 text-blue-800',
      'low-carb': 'bg-orange-100 text-orange-800',
      'high-protein': 'bg-red-100 text-red-800',
      'gluten-free': 'bg-yellow-100 text-yellow-800',
      paleo: 'bg-amber-100 text-amber-800',
      mediterranean: 'bg-cyan-100 text-cyan-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getPersonalizedBadgeInfo = (badge: string) => {
    const badgeMap: Record<string, { label: string; color: string; icon: any }> = {
      optimal_calories: { label: 'Optimal Calories', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 },
      low_calories: { label: 'Low Calories', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle2 },
      high_calories: { label: 'High Calories', color: 'bg-red-100 text-red-800 border-red-300', icon: AlertCircle },
      high_protein: { label: 'High Protein', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Sparkles },
      low_carb: { label: 'Low Carb', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: Sparkles },
      low_fat: { label: 'Low Fat', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Sparkles },
      keto_friendly: { label: 'Keto Friendly', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Sparkles },
      vegan: { label: 'Vegan', color: 'bg-green-100 text-green-800 border-green-300', icon: Sparkles },
      vegetarian: { label: 'Vegetarian', color: 'bg-lime-100 text-lime-800 border-lime-300', icon: Sparkles },
      gluten_free: { label: 'Gluten Free', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Sparkles },
    };
    return badgeMap[badge] || { label: badge, color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Sparkles };
  };

  const getCalorieBadgeColor = (food: DietFood) => {
    if (!food.personalized) return '';
    const { calorieMatch, macroScore } = food.personalized;

    if (macroScore >= 80 && calorieMatch) return 'border-green-500 bg-green-50';
    if (macroScore >= 60) return 'border-blue-500 bg-blue-50';
    return 'border-gray-300';
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/diet-restaurants')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Restaurants
        </Button>

        {/* Restaurant Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              {restaurant.image && (
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full md:w-48 h-48 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2 flex items-center gap-2">
                  {restaurant.name}
                  {restaurant.rating > 0 && (
                    <div className="flex items-center gap-1 text-base font-normal">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span>{restaurant.rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">
                        ({restaurant.totalReviews} reviews)
                      </span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="text-base mb-4">
                  {restaurant.description}
                </CardDescription>

                {/* Diet Types */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurant.dietTypes.map((type) => (
                    <Badge key={type} className={getDietTypeBadgeColor(type)} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  {restaurant.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>
                        {[
                          restaurant.address.street,
                          restaurant.address.city,
                          restaurant.address.state,
                          restaurant.address.zipCode,
                          restaurant.address.country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                  {restaurant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                  {restaurant.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{restaurant.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Personalization Controls */}
        {userPreferences?.hasPreferences && userPreferences.tdee && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">Personalized Menu</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} budget: ~{userPreferences.mealBudgets?.[selectedMealType as keyof typeof userPreferences.mealBudgets]?.target} cal
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="personalized-toggle-detail" className="text-sm font-medium">
                    {showPersonalized ? 'ON' : 'OFF'}
                  </Label>
                  <Switch
                    id="personalized-toggle-detail"
                    checked={showPersonalized}
                    onCheckedChange={setShowPersonalized}
                  />
                </div>
              </div>
            </CardHeader>
            {showPersonalized && (
              <CardContent className="pt-0">
                <div className="flex gap-2 flex-wrap">
                  <Label className="text-sm font-medium text-gray-700 mt-2">Meal Type:</Label>
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealType) => (
                    <Button
                      key={mealType}
                      variant={selectedMealType === mealType ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMealType(mealType)}
                    >
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Menu</h2>

              {/* Diet Type Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={!selectedDietType ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDietType('')}
                >
                  All
                </Button>
                {restaurant.dietTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedDietType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDietType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {!loading && dietFoods.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">No menu items available</p>
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {dietFoods.map((food) => (
                  <Card key={food._id} className={`flex flex-col ${showPersonalized && food.personalized ? getCalorieBadgeColor(food) : ''} ${showPersonalized && food.personalized?.macroScore >= 80 ? 'border-2' : ''}`}>
                    <CardContent className="p-4 flex flex-col flex-grow">
                      {/* Food Image */}
                      {food.image && (
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}

                      {/* Header with Title and Price */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-lg">{food.name}</h3>
                            {showPersonalized && food.personalized && food.personalized.macroScore >= 80 && (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Top Match
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price and Serving */}
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-2xl font-bold text-primary">${food.price.toFixed(2)}</p>
                        {food.servingSize && (
                          <p className="text-xs text-gray-500">{food.servingSize}</p>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge className={getDietTypeBadgeColor(food.dietType)} variant="secondary">
                          {food.dietType}
                        </Badge>
                        {showPersonalized && food.personalized?.badges.slice(0, 2).map((badge, idx) => {
                          const badgeInfo = getPersonalizedBadgeInfo(badge);
                          const Icon = badgeInfo.icon;
                          return (
                            <Badge key={idx} className={badgeInfo.color} variant="secondary">
                              <Icon className="h-3 w-3 mr-1" />
                              {badgeInfo.label}
                            </Badge>
                          );
                        })}
                        {showPersonalized && food.personalized && (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                            Score: {food.personalized.macroScore}/100
                          </Badge>
                        )}
                      </div>

                      {/* Match Reasons */}
                      {showPersonalized && food.personalized && food.personalized.matchReasons.length > 0 && (
                        <div className="mb-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                          <strong>Why:</strong> {food.personalized.matchReasons.slice(0, 2).join(' • ')}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{food.description}</p>

                      {/* Nutrition Info - Grid Layout */}
                      <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-gray-50 rounded text-xs">
                        <div>
                          <span className="text-gray-500">Calories:</span>
                          <div className="font-bold text-sm">{food.calories}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Protein:</span>
                          <div className="font-bold text-sm">{food.protein}g</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Carbs:</span>
                          <div className="font-bold text-sm">{food.carbs}g</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Fats:</span>
                          <div className="font-bold text-sm">{food.fat}g</div>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        onClick={() => addToCart(food)}
                        disabled={!food.isAvailable}
                        className="w-full mt-auto"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {food.isAvailable ? 'Add to Cart' : 'Unavailable'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item._id} className="flex justify-between items-center border-b pb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item._id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item._id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item._id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Calorie Budget Reminder */}
                    {getCalorieBudgetStatus() && (
                      <div className={`border rounded-lg p-3 mb-3 text-sm ${getCalorieBudgetStatus()?.color}`}>
                        <div className="flex items-start gap-2">
                          {getCalorieBudgetStatus()?.status === 'over' && <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
                          {getCalorieBudgetStatus()?.status === 'at-target' && <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />}
                          {getCalorieBudgetStatus()?.status === 'in-range' && <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />}
                          <div className="flex-1">
                            <p className="font-medium">{getCalorieBudgetStatus()?.message}</p>
                            {/* Progress Bar */}
                            <div className="mt-2 w-full bg-white rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  getCalorieBudgetStatus()?.status === 'over' ? 'bg-red-500' :
                                  getCalorieBudgetStatus()?.status === 'at-target' ? 'bg-green-500' :
                                  getCalorieBudgetStatus()?.status === 'in-range' ? 'bg-blue-500' :
                                  'bg-gray-400'
                                }`}
                                style={{ width: `${Math.min(getCalorieBudgetStatus()?.percentage || 0, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg">Total Price:</span>
                        <span className="font-bold text-2xl text-primary">
                          ${getTotalPrice().toFixed(2)}
                        </span>
                      </div>
                      {cart.length > 0 && (
                        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                          <span>Total Calories:</span>
                          <span className="font-semibold">{getTotalCalories()} cal</span>
                        </div>
                      )}
                      <Button
                        className="w-full"
                        onClick={() => setShowCheckout(true)}
                        disabled={cart.length === 0}
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Enter your delivery details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Street Address</label>
              <Input
                value={deliveryAddress.street}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input
                  value={deliveryAddress.state}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                  placeholder="State"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Zip Code</label>
                <Input
                  value={deliveryAddress.zipCode}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                  placeholder="12345"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={deliveryAddress.country}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Special Instructions (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests..."
                rows={3}
              />
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between mb-4">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-xl text-primary">${getTotalPrice().toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantDetails;
