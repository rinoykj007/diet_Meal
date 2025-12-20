import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '@/lib/api';
import { Search, MapPin, Star, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
}

const DietRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDietType, setSelectedDietType] = useState('');
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
    fetchRestaurants();
  }, [selectedDietType]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Diet Restaurants</h1>
          <p className="text-gray-600">
            Browse diet-focused restaurants and order healthy meals
          </p>
        </div>

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
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
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
