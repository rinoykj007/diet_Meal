import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { orderAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ChefHat, MapPin, Calendar, Loader2 } from 'lucide-react';

interface RecipeDetails {
    recipeName: string;
    description: string;
    ingredients: string[];
    instructions: string;
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
    mealType: string;
}

interface Restaurant {
    _id: string;
    name: string;
    image: string;
}

interface CustomRecipeOrderModalProps {
    open: boolean;
    onClose: () => void;
    recipe: RecipeDetails | null;
    restaurant: Restaurant | null;
}

export default function CustomRecipeOrderModal({
    open,
    onClose,
    recipe,
    restaurant
}: CustomRecipeOrderModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [deliveryAddress, setDeliveryAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
    });

    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recipe || !restaurant) return;

        // Validation
        if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
            toast({
                title: 'Error',
                description: 'Please fill in all delivery address fields',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoading(true);

            await orderAPI.createCustomRecipeOrder({
                restaurantId: restaurant._id,
                recipeDetails: recipe,
                deliveryAddress,
                notes
            });

            toast({
                title: 'Success!',
                description: `Custom recipe request sent to ${restaurant.name}. You'll be notified when they quote a price.`,
            });

            // Reset form
            setDeliveryAddress({
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'USA'
            });
            setNotes('');

            onClose();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to send request',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!recipe || !restaurant) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ChefHat className="w-5 h-5" />
                        Order Custom Recipe
                    </DialogTitle>
                    <DialogDescription>
                        Send this recipe to {restaurant.name} for preparation
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Recipe Summary */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center gap-3">
                            <img
                                src={restaurant.image}
                                alt={restaurant.name}
                                className="w-12 h-12 rounded object-cover"
                            />
                            <div>
                                <h3 className="font-semibold">{recipe.recipeName}</h3>
                                <p className="text-sm text-muted-foreground">{restaurant.name}</p>
                            </div>
                            <Badge variant="secondary" className="ml-auto">
                                {recipe.mealType}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t">
                            <div>
                                <p className="text-xs text-muted-foreground">Calories</p>
                                <p className="font-semibold">{recipe.calories}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Protein</p>
                                <p className="font-semibold">{recipe.macros.protein}g</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Carbs</p>
                                <p className="font-semibold">{recipe.macros.carbs}g</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Fats</p>
                                <p className="font-semibold">{recipe.macros.fats}g</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <Label className="text-base font-semibold">Delivery Address</Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="street">Street Address *</Label>
                            <Input
                                id="street"
                                value={deliveryAddress.street}
                                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                                placeholder="123 Main St, Apt 4B"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    value={deliveryAddress.city}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                                    placeholder="New York"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input
                                    id="state"
                                    value={deliveryAddress.state}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                                    placeholder="NY"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">ZIP Code *</Label>
                                <Input
                                    id="zipCode"
                                    value={deliveryAddress.zipCode}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                                    placeholder="10001"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={deliveryAddress.country}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                                    placeholder="USA"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Special Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Special Requests (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any dietary restrictions, preferences, or special instructions..."
                            rows={3}
                        />
                    </div>

                    {/* Info Note */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            The restaurant will review your recipe and quote a price. You'll be notified when ready.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Request'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
