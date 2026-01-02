import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { restaurantAPI, dietFoodAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, UtensilsCrossed, DollarSign, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface DietFood {
    _id: string;
    name: string;
    description?: string;
    dietType: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    price: number;
    image?: string;
    isAvailable: boolean;
    servingSize?: string;
    preparationTime?: number;
}

interface Restaurant {
    _id: string;
    name: string;
    dietTypes: string[];
    isApproved: boolean;
}

export default function RestaurantMenu() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<DietFood[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DietFood | null>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dietType: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        price: 0,
        servingSize: '',
        preparationTime: 0,
        image: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const restaurantRes = await restaurantAPI.getMyRestaurant();
            const restaurantData = restaurantRes.data.data;
            setRestaurant(restaurantData);

            if (restaurantData?._id) {
                const menuRes = await dietFoodAPI.getByRestaurant(restaurantData._id);
                setMenuItems(menuRes.data.data || []);
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!restaurant?._id) {
            toast({
                title: 'Error',
                description: 'Restaurant not found',
                variant: 'destructive',
            });
            return;
        }

        try {
            const payload = {
                ...formData,
                restaurantId: restaurant._id,
                fiber: 0,
                sugar: 0,
                sodium: 0,
                ingredients: [],
                allergens: [],
            };

            if (editingItem) {
                await dietFoodAPI.update(editingItem._id, payload);
                toast({
                    title: 'Success',
                    description: 'Menu item updated successfully',
                });
            } else {
                await dietFoodAPI.create(payload);
                toast({
                    title: 'Success',
                    description: 'Menu item created successfully',
                });
            }

            setDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error('Error saving menu item:', error);

            // Extract validation errors if available
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.join('. ')
                : error.response?.data?.message || 'Failed to save menu item';

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (item: DietFood) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            dietType: item.dietType,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            price: item.price,
            servingSize: item.servingSize || '',
            preparationTime: item.preparationTime || 0,
            image: item.image || '',
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await dietFoodAPI.delete(id);
            toast({
                title: 'Success',
                description: 'Menu item deleted successfully',
            });
            fetchData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete menu item',
                variant: 'destructive',
            });
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            dietType: '',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            price: 0,
            servingSize: '',
            preparationTime: 0,
            image: '',
        });
    };

    // Calculate calories from macros
    const calculateMacroCalories = () => {
        const protein = parseFloat(String(formData.protein)) || 0;
        const carbs = parseFloat(String(formData.carbs)) || 0;
        const fat = parseFloat(String(formData.fat)) || 0;
        return (protein * 4) + (carbs * 4) + (fat * 9);
    };

    // Get macro consistency warning message
    const getMacroWarning = () => {
        const stated = parseFloat(String(formData.calories)) || 0;
        const calculated = calculateMacroCalories();
        const tolerance = 0.10;

        if (stated === 0 || calculated === 0) return null;

        const diff = Math.abs(stated - calculated);
        const percentDiff = (diff / calculated) * 100;

        if (percentDiff > tolerance * 100) {
            return {
                type: 'warning',
                message: `Warning: Stated calories (${stated}) don't match calculated calories (${Math.round(calculated)}) from macros. Difference: ${Math.round(percentDiff)}%`
            };
        }

        return null;
    };

    if (loading) {
        return (
            <DashboardLayout role="restaurant">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!restaurant) {
        return (
            <DashboardLayout role="restaurant">
                <Card className="text-center py-12">
                    <CardContent>
                        <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Restaurant Found</h3>
                        <p className="text-muted-foreground">Please register your restaurant first</p>
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    // Only allow adding menu items if restaurant is approved
    const canAddMenuItem = restaurant?.isApproved === true;

    return (
        <DashboardLayout role="restaurant">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-2">
                            <UtensilsCrossed className="h-8 w-8" />
                            Menu Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your restaurant's food items
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <DialogTrigger asChild>
                                            <Button onClick={resetForm} disabled={!canAddMenuItem}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Menu Item
                                            </Button>
                                        </DialogTrigger>
                                    </div>
                                </TooltipTrigger>
                                {!canAddMenuItem && (
                                    <TooltipContent>
                                        <p>Wait for admin approval to add menu items</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                                <DialogDescription>
                                    {editingItem ? 'Update' : 'Create a new'} food item for your menu
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label htmlFor="name">Item Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="dietType">Diet Type *</Label>
                                        <Select
                                            value={formData.dietType}
                                            onValueChange={(value) => setFormData({ ...formData, dietType: value })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select diet type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {restaurant.dietTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="price">Price ($) *</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="calories">Calories *</Label>
                                        <Input
                                            id="calories"
                                            name="calories"
                                            type="number"
                                            min="50"
                                            max="2000"
                                            step="1"
                                            value={formData.calories}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 450"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Range: 50-2000 calories</p>
                                    </div>

                                    <div>
                                        <Label htmlFor="protein">Protein (g) *</Label>
                                        <Input
                                            id="protein"
                                            name="protein"
                                            type="number"
                                            min="0"
                                            max="150"
                                            step="0.1"
                                            value={formData.protein}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 25"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Range: 0-150g</p>
                                    </div>

                                    <div>
                                        <Label htmlFor="carbs">Carbs (g) *</Label>
                                        <Input
                                            id="carbs"
                                            name="carbs"
                                            type="number"
                                            min="0"
                                            max="300"
                                            step="0.1"
                                            value={formData.carbs}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 50"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Range: 0-300g</p>
                                    </div>

                                    <div>
                                        <Label htmlFor="fat">Fat (g) *</Label>
                                        <Input
                                            id="fat"
                                            name="fat"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={formData.fat}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 15"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Range: 0-100g</p>
                                    </div>

                                    {/* Macro Consistency Warning */}
                                    {getMacroWarning() && (
                                        <div className="col-span-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                {getMacroWarning()!.message}
                                            </p>
                                            <p className="text-xs text-yellow-700 mt-1">
                                                Formula: (Protein × 4) + (Carbs × 4) + (Fat × 9) ≈ Calories
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <Label htmlFor="servingSize">Serving Size</Label>
                                        <Input
                                            id="servingSize"
                                            name="servingSize"
                                            placeholder="e.g., 350g"
                                            value={formData.servingSize}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="preparationTime">Prep Time (min)</Label>
                                        <Input
                                            id="preparationTime"
                                            name="preparationTime"
                                            type="number"
                                            value={formData.preparationTime}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <Label htmlFor="image">Image URL</Label>
                                        <Input
                                            id="image"
                                            name="image"
                                            type="url"
                                            placeholder="https://..."
                                            value={formData.image}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingItem ? 'Update' : 'Create'} Item
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{menuItems.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Available
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {menuItems.filter((item) => item.isAvailable).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Unavailable
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {menuItems.filter((item) => !item.isAvailable).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Approval Status Alert */}
                {restaurant && !restaurant.isApproved && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-900">
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold">⏳ Pending Admin Approval</p>
                                <p className="text-sm">
                                    Your restaurant is awaiting admin approval. You cannot add menu items until your restaurant is approved.
                                </p>
                                <p className="text-sm font-semibold mt-1">
                                    The "Add Menu Item" button will be enabled after admin approval.
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {restaurant && restaurant.isApproved && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-900">
                            <p className="font-semibold">✓ Restaurant Approved</p>
                            <p className="text-sm">Your restaurant is approved! You can now add menu items.</p>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Menu Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Menu Items</CardTitle>
                        <CardDescription>All food items in your menu</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {menuItems.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>No menu items yet</p>
                                <p className="text-sm">Click "Add Menu Item" to get started</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {menuItems.map((item) => (
                                    <Card key={item._id} className="overflow-hidden">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                    <Badge variant="secondary" className="text-xs mt-1">
                                                        {item.dietType}
                                                    </Badge>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lg flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        {item.price.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            {item.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}

                                            <div className="grid grid-cols-4 gap-2 text-xs">
                                                <div className="text-center">
                                                    <div className="font-semibold">{item.calories}</div>
                                                    <div className="text-muted-foreground">cal</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold">{item.protein}g</div>
                                                    <div className="text-muted-foreground">protein</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold">{item.carbs}g</div>
                                                    <div className="text-muted-foreground">carbs</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold">{item.fat}g</div>
                                                    <div className="text-muted-foreground">fat</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
