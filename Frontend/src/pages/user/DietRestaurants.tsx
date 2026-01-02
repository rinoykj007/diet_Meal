import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI, aiDietAPI } from '@/lib/api';
import { Search, MapPin, Star, ChefHat, Sparkles, AlertCircle, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import CountUp from 'react-countup';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  dietTypes: string[];
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  image?: string;
  rating: number;
  totalReviews: number;
  phone?: string;
  matchingFoodsCount?: number;
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
  message?: string;
  warning?: string;
}

const DietRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDietType, setSelectedDietType] = useState('');
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('lunch');
  const [showTDEEModal, setShowTDEEModal] = useState(true); // TDEE confirmation modal
  const [tdeeModalMode, setTdeeModalMode] = useState<'confirm' | 'setup' | 'edit'>('setup'); // confirm, setup, edit
  const [quickTDEEData, setQuickTDEEData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: 'moderate'
  });
  const { toast } = useToast();

  const dietTypes = [
    'All',
    'keto',
    'vegan',
    'vegetarian',
    'diabetic',
    'low-carb',
    'high-protein',
    'gluten-free',
    'paleo',
    'mediterranean',
  ];

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [selectedDietType, showPersonalized, selectedMealType]);

  const fetchUserPreferences = async () => {
    try {
      const response = await aiDietAPI.getUserPreferences();
      const prefs = response.data.data;
      setUserPreferences(prefs);

      // Check if TDEE exists
      if (prefs.hasPreferences && prefs.tdee) {
        // TDEE exists - show confirmation modal
        setTdeeModalMode('confirm');
        setShowPersonalized(true);
      } else {
        // TDEE doesn't exist - show setup modal
        setTdeeModalMode('setup');
      }
    } catch (error: any) {
      console.log('No user preferences found:', error);
      setUserPreferences({ hasPreferences: false });
      setTdeeModalMode('setup');
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDietType && selectedDietType !== 'All') {
        params.dietType = selectedDietType;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add personalization parameters
      if (showPersonalized && userPreferences?.hasPreferences) {
        params.personalized = 'true';
        params.mealType = selectedMealType;
      }

      const response = await restaurantAPI.getAll(params);
      setRestaurants(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch restaurants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRestaurants();
  };

  // Handler: User clicks OK (use existing TDEE)
  const handleConfirmTDEE = () => {
    setShowTDEEModal(false);
    setShowPersonalized(true);
    fetchRestaurants();
  };

  // Handler: User clicks Edit (update TDEE)
  const handleEditTDEE = () => {
    setTdeeModalMode('edit');
  };

  // Handler: Save/Update TDEE to database
  const handleSaveTDEE = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!quickTDEEData.age || !quickTDEEData.gender || !quickTDEEData.height || !quickTDEEData.weight) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields (age, gender, height, weight)',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Save/Update preferences to database
      await aiDietAPI.saveUserPreferences({
        age: Number(quickTDEEData.age),
        gender: quickTDEEData.gender as 'male' | 'female',
        height: Number(quickTDEEData.height),
        weight: Number(quickTDEEData.weight),
        activityLevel: quickTDEEData.activityLevel
      });

      // Fetch updated preferences
      await fetchUserPreferences();

      // Switch to confirm mode to show calculation results
      setTdeeModalMode('confirm');

      toast({
        title: 'TDEE Calculated!',
        description: 'Review your results below',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save TDEE',
        variant: 'destructive',
      });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* TDEE Confirmation/Setup Modal - Blocks access until TDEE is confirmed/set */}
      {showTDEEModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">
                  {tdeeModalMode === 'confirm' && 'Confirm Your TDEE'}
                  {tdeeModalMode === 'setup' && 'Set Up Your TDEE'}
                  {tdeeModalMode === 'edit' && 'Update Your TDEE'}
                </CardTitle>
              </div>
              {tdeeModalMode === 'confirm' && (
                <CardDescription className="text-xs">We found your previously calculated TDEE. Would you like to use it or update?</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {/* CONFIRM MODE - Show existing TDEE with OK/Edit buttons */}
              {tdeeModalMode === 'confirm' && userPreferences && (
                <div className="space-y-3">
                  {/* Top Row: BMR and TDEE (2 columns) */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* BMR */}
                    {userPreferences.bmr && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Basal Metabolic Rate (BMR)</p>
                        <p className="text-xs text-gray-600">Calories burned at rest</p>
                        <p className="text-2xl font-bold text-gray-700 mt-1">
                          <CountUp end={userPreferences.bmr} duration={1.5} separator="," /> cal
                        </p>
                      </div>
                    )}

                    {/* TDEE */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Total Daily Energy Expenditure (TDEE)</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        <CountUp end={userPreferences.tdee} duration={1.5} separator="," />
                      </p>
                      <p className="text-xs text-gray-600">calories/day</p>
                    </div>
                  </div>

                  {/* Bottom Row: Meal Budgets (2x2 grid) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600">Breakfast</p>
                      <p className="text-base font-bold text-blue-600">
                        <CountUp end={userPreferences.mealBudgets?.breakfast.target || 0} duration={1.5} separator="," />
                      </p>
                      <p className="text-xs text-gray-500">cal (25%)</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-gray-600">Lunch</p>
                      <p className="text-base font-bold text-green-600">
                        <CountUp end={userPreferences.mealBudgets?.lunch.target || 0} duration={1.5} separator="," />
                      </p>
                      <p className="text-xs text-gray-500">cal (35%)</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-gray-600">Dinner</p>
                      <p className="text-base font-bold text-orange-600">
                        <CountUp end={userPreferences.mealBudgets?.dinner.target || 0} duration={1.5} separator="," />
                      </p>
                      <p className="text-xs text-gray-500">cal (30%)</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-xs text-gray-600">Snacks</p>
                      <p className="text-base font-bold text-purple-600">
                        <CountUp end={userPreferences.mealBudgets?.snacks.target || 0} duration={1.5} separator="," />
                      </p>
                      <p className="text-xs text-gray-500">cal (10%)</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm" onClick={handleConfirmTDEE}>
                      Continue to Food Recommendations
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleEditTDEE}>
                      Edit TDEE
                    </Button>
                  </div>
                </div>
              )}

              {/* SETUP/EDIT MODE - Show form to enter/update details */}
              {(tdeeModalMode === 'setup' || tdeeModalMode === 'edit') && (
                <form onSubmit={handleSaveTDEE} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="modal-age">Age (years) *</Label>
                      <Input
                        id="modal-age"
                        type="number"
                        placeholder="e.g., 30"
                        value={quickTDEEData.age}
                        onChange={(e) => setQuickTDEEData({ ...quickTDEEData, age: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="modal-gender">Gender *</Label>
                      <Select
                        value={quickTDEEData.gender}
                        onValueChange={(value) => setQuickTDEEData({ ...quickTDEEData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="modal-height">Height (cm) *</Label>
                      <Input
                        id="modal-height"
                        type="number"
                        placeholder="e.g., 170"
                        value={quickTDEEData.height}
                        onChange={(e) => setQuickTDEEData({ ...quickTDEEData, height: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="modal-weight">Weight (kg) *</Label>
                      <Input
                        id="modal-weight"
                        type="number"
                        placeholder="e.g., 70"
                        value={quickTDEEData.weight}
                        onChange={(e) => setQuickTDEEData({ ...quickTDEEData, weight: e.target.value })}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="modal-activity">Activity Level</Label>
                      <Select
                        value={quickTDEEData.activityLevel}
                        onValueChange={(value) => setQuickTDEEData({ ...quickTDEEData, activityLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                          <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                          <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                          <SelectItem value="very_active">Very Active (intense exercise daily)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" size="lg">
                      {tdeeModalMode === 'setup' ? 'Calculate & Save TDEE' : 'Update TDEE'}
                    </Button>
                    {tdeeModalMode === 'edit' && (
                      <Button type="button" variant="outline" size="lg" onClick={() => setTdeeModalMode('confirm')}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Diet Restaurants</h1>
          <p className="text-gray-600">
            Browse diet-focused restaurants and order healthy meals
          </p>
        </div>


        {/* Personalization Controls */}
        {userPreferences?.hasPreferences && userPreferences.tdee && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">Personalized Recommendations</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Your daily target: {userPreferences.tdee} cal | {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} budget: ~{userPreferences.mealBudgets?.[selectedMealType as keyof typeof userPreferences.mealBudgets]?.target} cal
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="personalized-toggle" className="text-sm font-medium">
                    {showPersonalized ? 'ON' : 'OFF'}
                  </Label>
                  <Switch
                    id="personalized-toggle"
                    checked={showPersonalized}
                    onCheckedChange={setShowPersonalized}
                  />
                </div>
              </div>
            </CardHeader>
            {showPersonalized && (
              <CardContent className="pt-0">
                <div className="flex gap-2">
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

        {/* Warning if incomplete profile */}
        {userPreferences?.warning && showPersonalized && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              {userPreferences.warning}
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>

          {/* Diet Type Filters */}
          <div className="flex flex-wrap gap-2">
            {dietTypes.map((type) => (
              <Button
                key={type}
                variant={selectedDietType === type || (type === 'All' && !selectedDietType) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDietType(type === 'All' ? '' : type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading restaurants...</p>
          </div>
        )}

        {/* Restaurants Grid */}
        {!loading && restaurants.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600 mb-4">
              {showPersonalized
                ? `No restaurants have foods matching your ${selectedMealType} preferences. Try a different meal type or turn off personalization.`
                : 'Try adjusting your search or filters'}
            </p>
            {showPersonalized && (
              <Button variant="outline" onClick={() => setShowPersonalized(false)}>
                View All Restaurants
              </Button>
            )}
          </div>
        )}

        {/* Results Count */}
        {!loading && restaurants.length > 0 && showPersonalized && (
          <p className="text-sm text-gray-600 mb-4">
            Showing {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} with foods matching your {selectedMealType} preferences
          </p>
        )}

        {!loading && restaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link key={restaurant._id} to={`/diet-restaurants/${restaurant._id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {restaurant.image && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="line-clamp-1">{restaurant.name}</span>
                      {restaurant.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{restaurant.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {restaurant.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Diet Types */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {restaurant.dietTypes.slice(0, 3).map((type) => (
                        <Badge
                          key={type}
                          className={getDietTypeBadgeColor(type)}
                          variant="secondary"
                        >
                          {type}
                        </Badge>
                      ))}
                      {restaurant.dietTypes.length > 3 && (
                        <Badge variant="secondary">+{restaurant.dietTypes.length - 3}</Badge>
                      )}
                    </div>

                    {/* Address */}
                    {restaurant.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {[restaurant.address.city, restaurant.address.state, restaurant.address.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Reviews Count */}
                    {restaurant.totalReviews > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {restaurant.totalReviews} review{restaurant.totalReviews !== 1 ? 's' : ''}
                      </p>
                    )}

                    {/* Matching Foods Count (Personalized Mode) */}
                    {showPersonalized && restaurant.matchingFoodsCount !== undefined && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {restaurant.matchingFoodsCount} matching food{restaurant.matchingFoodsCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DietRestaurants;
