import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { restaurantAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Store, CheckCircle, AlertCircle, Save } from 'lucide-react';

const DIET_TYPES = [
    { id: 'keto', label: 'Keto' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'diabetic', label: 'Diabetic' },
    { id: 'low-carb', label: 'Low-Carb' },
    { id: 'high-protein', label: 'High-Protein' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'paleo', label: 'Paleo' },
    { id: 'mediterranean', label: 'Mediterranean' },
];

export default function RestaurantProfile() {
    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dietTypes: [] as string[],
        phone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        image: '',
    });

    useEffect(() => {
        fetchRestaurant();
    }, []);

    const fetchRestaurant = async () => {
        try {
            setLoading(true);
            const response = await restaurantAPI.getMyRestaurant();
            const data = response.data.data;
            setRestaurant(data);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                dietTypes: data.dietTypes || [],
                phone: data.phone || '',
                email: data.email || '',
                street: data.address?.street || '',
                city: data.address?.city || '',
                state: data.address?.state || '',
                zipCode: data.address?.zipCode || '',
                country: data.address?.country || '',
                image: data.image || '',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load restaurant',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDietTypeToggle = (dietType: string) => {
        setFormData({
            ...formData,
            dietTypes: formData.dietTypes.includes(dietType)
                ? formData.dietTypes.filter((t) => t !== dietType)
                : [...formData.dietTypes, dietType],
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!restaurant?._id) return;

        if (formData.dietTypes.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'Please select at least one diet type',
                variant: 'destructive',
            });
            return;
        }

        try {
            setSaving(true);
            await restaurantAPI.update(restaurant._id, {
                name: formData.name,
                description: formData.description,
                dietTypes: formData.dietTypes,
                phone: formData.phone,
                email: formData.email,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                },
                image: formData.image,
            });

            toast({
                title: 'Success',
                description: 'Restaurant profile updated successfully',
            });

            fetchRestaurant();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update profile',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
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

    return (
        <DashboardLayout role="restaurant">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-2">
                            <Store className="h-8 w-8" />
                            Restaurant Profile
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage your restaurant information</p>
                    </div>
                    <div className="flex gap-2">
                        {!restaurant?.isApproved && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Pending Approval
                            </Badge>
                        )}
                        {restaurant?.isApproved && restaurant?.isActive && (
                            <Badge variant="default" className="flex items-center gap-1 bg-green-500">
                                <CheckCircle className="h-3 w-3" />
                                Active
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Update your restaurant's basic details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Restaurant Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Tell customers about your restaurant..."
                                />
                            </div>

                            <div>
                                <Label htmlFor="image">Restaurant Image URL</Label>
                                <Input
                                    id="image"
                                    name="image"
                                    type="url"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Diet Types */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Diet Types *</CardTitle>
                            <CardDescription>Select all diet types your restaurant offers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {DIET_TYPES.map((diet) => (
                                    <div key={diet.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={diet.id}
                                            checked={formData.dietTypes.includes(diet.id)}
                                            onCheckedChange={() => handleDietTypeToggle(diet.id)}
                                        />
                                        <Label htmlFor={diet.id} className="cursor-pointer font-normal">
                                            {diet.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>How customers can reach you</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="contact@restaurant.com"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Address</CardTitle>
                            <CardDescription>Your restaurant's location</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="street">Street Address</Label>
                                <Input
                                    id="street"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    placeholder="123 Main Street"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="New York"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="NY"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="zipCode">Zip Code</Label>
                                    <Input
                                        id="zipCode"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        placeholder="10001"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        placeholder="USA"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
