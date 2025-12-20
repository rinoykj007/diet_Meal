import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { restaurantAPI } from '@/lib/api';
import { Search, Store, MapPin, Star } from 'lucide-react';

interface Restaurant {
    _id: string;
    name: string;
    description: string;
    image: string;
    address: {
        city: string;
        state: string;
    };
    rating: number;
    dietTypes: string[];
}

interface RestaurantSelectionModalProps {
    open: boolean;
    onClose: () => void;
    onSelectRestaurant: (restaurant: Restaurant) => void;
}

export default function RestaurantSelectionModal({
    open,
    onClose,
    onSelectRestaurant
}: RestaurantSelectionModalProps) {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (open) {
            fetchRestaurants();
        }
    }, [open]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await restaurantAPI.getAll({ isApproved: true });
            setRestaurants(response.data.data || []);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRestaurants = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.dietTypes.some(dt => dt.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        Select Restaurant
                    </DialogTitle>
                    <DialogDescription>
                        Choose a restaurant to send your custom recipe request
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search restaurants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Restaurant List */}
                <div className="space-y-3 mt-4">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading restaurants...
                        </div>
                    ) : filteredRestaurants.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No restaurants found
                        </div>
                    ) : (
                        filteredRestaurants.map((restaurant) => (
                            <Card
                                key={restaurant._id}
                                className="cursor-pointer hover:border-primary transition-colors"
                                onClick={() => {
                                    onSelectRestaurant(restaurant);
                                    onClose();
                                }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <img
                                            src={restaurant.image}
                                            alt={restaurant.name}
                                            className="w-20 h-20 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {restaurant.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="text-xs">
                                                        {restaurant.address.city}, {restaurant.address.state}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs">{restaurant.rating}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 mt-2">
                                                {restaurant.dietTypes.slice(0, 3).map((type) => (
                                                    <Badge key={type} variant="secondary" className="text-xs">
                                                        {type}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <Button size="sm">
                                            Select
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
