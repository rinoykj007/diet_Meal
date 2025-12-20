import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI, dietFoodAPI, orderAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, MapPin, Phone, Mail, Star, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
    if (id) {
      fetchRestaurantDetails();
      fetchDietFoods();
    }
  }, [id, selectedDietType]);

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
      const response = await dietFoodAPI.getByRestaurant(id!, selectedDietType);
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
              <div className="space-y-4">
                {dietFoods.map((food) => (
                  <Card key={food._id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {food.image && (
                          <img
                            src={food.image}
                            alt={food.name}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{food.name}</h3>
                              <Badge className={getDietTypeBadgeColor(food.dietType)} variant="secondary">
                                {food.dietType}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">${food.price.toFixed(2)}</p>
                              {food.servingSize && (
                                <p className="text-xs text-gray-500">{food.servingSize}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{food.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500 space-x-3">
                              <span>{food.calories} cal</span>
                              <span>P: {food.protein}g</span>
                              <span>C: {food.carbs}g</span>
                              <span>F: {food.fat}g</span>
                            </div>
                            <Button
                              onClick={() => addToCart(food)}
                              disabled={!food.isAvailable}
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
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

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg">Total:</span>
                        <span className="font-bold text-2xl text-primary">
                          ${getTotalPrice().toFixed(2)}
                        </span>
                      </div>
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
