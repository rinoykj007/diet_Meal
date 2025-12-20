import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { restaurantAPI, orderAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
    Package,
    CheckCircle,
    XCircle,
    Clock,
    Truck,
    AlertCircle,
} from 'lucide-react';

interface Order {
    _id: string;
    userId: {
        fullName: string;
        email: string;
        phone?: string;
    };
    items: Array<{
        dietFoodId: { name: string };
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: string;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    deliveryDate?: string;
    paymentMethod?: string;
    notes?: string;
    createdAt: string;

    // Custom Recipe Fields
    isCustomRecipe?: boolean;
    recipeDetails?: {
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
    };
    customPriceStatus?: 'pending-quote' | 'quoted' | 'accepted' | 'rejected';
    quotedPrice?: number;
    quotedAt?: string;
}

export default function RestaurantOrders() {
    const [restaurant, setRestaurant] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [quotePrices, setQuotePrices] = useState<Record<string, string>>({});
    const [quotingOrder, setQuotingOrder] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [activeTab, orders]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const restaurantRes = await restaurantAPI.getMyRestaurant();
            const restaurantData = restaurantRes.data.data;
            setRestaurant(restaurantData);

            if (restaurantData?._id) {
                const ordersRes = await orderAPI.getRestaurantOrders(restaurantData._id);
                setOrders(ordersRes.data.data || []);
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load orders',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        if (activeTab === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter((order) => order.status === activeTab));
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await orderAPI.updateStatus(orderId, status);
            toast({
                title: 'Success',
                description: 'Order status updated successfully',
            });
            fetchData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update order',
                variant: 'destructive',
            });
        }
    };

    const handleQuotePrice = async (orderId: string) => {
        const price = quotePrices[orderId];

        if (!price || parseFloat(price) <= 0) {
            toast({
                title: 'Error',
                description: 'Please enter a valid price',
                variant: 'destructive',
            });
            return;
        }

        try {
            setQuotingOrder(orderId);
            await orderAPI.quotePrice(orderId, parseFloat(price));
            toast({
                title: 'Success',
                description: 'Price quoted successfully',
            });
            setQuotePrices({ ...quotePrices, [orderId]: '' });
            fetchData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to quote price',
                variant: 'destructive',
            });
        } finally {
            setQuotingOrder(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { color: string; icon: any }> = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
            preparing: { color: 'bg-purple-100 text-purple-800', icon: Package },
            'out-for-delivery': { color: 'bg-indigo-100 text-indigo-800', icon: Truck },
            delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
        };
        const config = configs[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        const Icon = config.icon;
        return (
            <Badge className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {status.replace('-', ' ')}
            </Badge>
        );
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

    const stats = {
        total: orders.length,
        pending: orders.filter((o) => o.status === 'pending').length,
        preparing: orders.filter((o) => o.status === 'preparing').length,
        delivered: orders.filter((o) => o.status === 'delivered').length,
    };

    return (
        <DashboardLayout role="restaurant">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-2">
                        <Package className="h-8 w-8" />
                        Order Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage all your restaurant orders</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Preparing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.preparing}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Delivered
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>View and manage all orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-6">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                                <TabsTrigger value="out-for-delivery">Delivery</TabsTrigger>
                                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                            </TabsList>
                            <TabsContent value={activeTab} className="mt-6">
                                {filteredOrders.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>No orders found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredOrders.map((order) => (
                                            <Card key={order._id}>
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold">{order.userId.fullName}</h3>
                                                                {getStatusBadge(order.status)}
                                                            </div>

                                                            <div className="text-sm text-muted-foreground space-y-1">
                                                                <div>📧 {order.userId.email}</div>
                                                                {order.userId.phone && <div>📞 {order.userId.phone}</div>}
                                                                <div>
                                                                    📍 {order.deliveryAddress.street}, {order.deliveryAddress.city},{' '}
                                                                    {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                                                                </div>
                                                                {order.notes && <div>📝 Note: {order.notes}</div>}
                                                            </div>

                                                            {/* Order Items or Custom Recipe Details */}
                                                            {order.isCustomRecipe && order.recipeDetails ? (
                                                                // Custom Recipe Display
                                                                <div className="space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="default" className="bg-orange-500">
                                                                            Custom Recipe
                                                                        </Badge>
                                                                        <Badge variant="secondary">
                                                                            {order.recipeDetails.mealType}
                                                                        </Badge>
                                                                    </div>

                                                                    <div>
                                                                        <h4 className="font-semibold text-lg">
                                                                            {order.recipeDetails.recipeName}
                                                                        </h4>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {order.recipeDetails.description}
                                                                        </p>
                                                                    </div>

                                                                    <div className="grid grid-cols-4 gap-2 p-2 bg-white rounded">
                                                                        <div className="text-center">
                                                                            <p className="text-xs text-muted-foreground">Calories</p>
                                                                            <p className="font-semibold">{order.recipeDetails.calories}</p>
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <p className="text-xs text-muted-foreground">Protein</p>
                                                                            <p className="font-semibold">{order.recipeDetails.macros.protein}g</p>
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <p className="text-xs text-muted-foreground">Carbs</p>
                                                                            <p className="font-semibold">{order.recipeDetails.macros.carbs}g</p>
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <p className="text-xs text-muted-foreground">Fats</p>
                                                                            <p className="font-semibold">{order.recipeDetails.macros.fats}g</p>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-sm font-semibold mb-1">Ingredients:</p>
                                                                        <ul className="text-sm text-muted-foreground space-y-0.5">
                                                                            {order.recipeDetails.ingredients.slice(0, 5).map((ingr, i) => (
                                                                                <li key={i}>• {ingr}</li>
                                                                            ))}
                                                                            {order.recipeDetails.ingredients.length > 5 && (
                                                                                <li>... and {order.recipeDetails.ingredients.length - 5} more</li>
                                                                            )}
                                                                        </ul>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-sm font-semibold mb-1">Instructions:</p>
                                                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                                                            {order.recipeDetails.instructions}
                                                                        </p>
                                                                    </div>

                                                                    {/* Quote Price Section */}
                                                                    {order.customPriceStatus === 'pending-quote' && (
                                                                        <div className="pt-2 border-t space-y-2">
                                                                            <Label htmlFor={`price-${order._id}`} className="text-sm font-semibold">
                                                                                Quote Price:
                                                                            </Label>
                                                                            <div className="flex gap-2">
                                                                                <Input
                                                                                    id={`price-${order._id}`}
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    min="0"
                                                                                    placeholder="Enter price (e.g. 15.99)"
                                                                                    value={quotePrices[order._id] || ''}
                                                                                    onChange={(e) => setQuotePrices({
                                                                                        ...quotePrices,
                                                                                        [order._id]: e.target.value
                                                                                    })}
                                                                                    className="flex-1"
                                                                                />
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => handleQuotePrice(order._id)}
                                                                                    disabled={quotingOrder === order._id}
                                                                                >
                                                                                    {quotingOrder === order._id ? 'Quoting...' : 'Quote'}
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {order.customPriceStatus === 'quoted' && (
                                                                        <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                                                                            <p className="text-sm">
                                                                                💰 Quoted: <span className="font-bold">${order.quotedPrice?.toFixed(2)}</span>
                                                                                {' '}- Waiting for customer response
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {order.customPriceStatus === 'accepted' && order.quotedPrice && (
                                                                        <div className="p-2 bg-green-50 border border-green-200 rounded">
                                                                            <p className="text-sm font-semibold text-green-800">
                                                                                ✅ Price Accepted: ${order.quotedPrice.toFixed(2)}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                // Regular Menu Items Display
                                                                <div className="space-y-1">
                                                                    <div className="text-sm font-semibold">Items:</div>
                                                                    {order.items.map((item, idx) => (
                                                                        <div key={idx} className="text-sm text-muted-foreground">
                                                                            {item.quantity}x {item.dietFoodId.name} - $
                                                                            {(item.price * item.quantity).toFixed(2)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="font-bold text-lg">
                                                                Total: ${(order.isCustomRecipe && order.quotedPrice
                                                                    ? order.quotedPrice
                                                                    : order.totalAmount).toFixed(2)}
                                                            </div>

                                                            <div className="text-xs text-muted-foreground">
                                                                Ordered: {new Date(order.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-2 min-w-[150px]">
                                                            {order.status === 'pending' && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                        Accept
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-1" />
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {order.status === 'confirmed' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleUpdateStatus(order._id, 'preparing')}
                                                                >
                                                                    Start Preparing
                                                                </Button>
                                                            )}
                                                            {order.status === 'preparing' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleUpdateStatus(order._id, 'out-for-delivery')}
                                                                >
                                                                    Out for Delivery
                                                                </Button>
                                                            )}
                                                            {order.status === 'out-for-delivery' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleUpdateStatus(order._id, 'delivered')}
                                                                >
                                                                    Mark Delivered
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
