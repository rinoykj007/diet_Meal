import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { restaurantAPI, orderAPI, dietFoodAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
    Star,
    UtensilsCrossed,
    Calendar,
    TrendingDown,
} from 'lucide-react';

export default function RestaurantAnalytics() {
    const [restaurant, setRestaurant] = useState<any>(null);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalMenuItems: 0,
        activeMenuItems: 0,
        rating: 0,
        totalReviews: 0,
        todayRevenue: 0,
        todayOrders: 0,
        weekRevenue: 0,
        weekOrders: 0,
        monthRevenue: 0,
        monthOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
    });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Fetch restaurant
            const restaurantRes = await restaurantAPI.getMyRestaurant();
            const restaurantData = restaurantRes.data.data;
            setRestaurant(restaurantData);

            if (!restaurantData?._id) return;

            // Fetch orders
            const ordersRes = await orderAPI.getRestaurantOrders(restaurantData._id);
            const orders = ordersRes.data.data || [];

            // Fetch menu items
            const menuRes = await dietFoodAPI.getByRestaurant(restaurantData._id);
            const menuItems = menuRes.data.data || [];

            // Calculate stats
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

            const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
            const totalOrders = orders.length;

            const todayOrders = orders.filter(
                (order) => new Date(order.createdAt) >= today
            );
            const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

            const weekOrders = orders.filter(
                (order) => new Date(order.createdAt) >= weekAgo
            );
            const weekRevenue = weekOrders.reduce((sum, order) => sum + order.totalAmount, 0);

            const monthOrders = orders.filter(
                (order) => new Date(order.createdAt) >= monthAgo
            );
            const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

            const pendingOrders = orders.filter(
                (order) => order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing'
            ).length;

            const completedOrders = orders.filter(
                (order) => order.status === 'delivered'
            ).length;

            const cancelledOrders = orders.filter(
                (order) => order.status === 'cancelled'
            ).length;

            setStats({
                totalRevenue,
                totalOrders,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                totalMenuItems: menuItems.length,
                activeMenuItems: menuItems.filter((item) => item.isAvailable).length,
                rating: restaurantData.rating || 0,
                totalReviews: restaurantData.totalReviews || 0,
                todayRevenue,
                todayOrders: todayOrders.length,
                weekRevenue,
                weekOrders: weekOrders.length,
                monthRevenue,
                monthOrders: monthOrders.length,
                pendingOrders,
                completedOrders,
                cancelledOrders,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load analytics',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
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
                <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-2">
                        <TrendingUp className="h-8 w-8" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">Track your restaurant's performance</p>
                </div>

                {/* Revenue Overview */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Today
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    ${stats.todayRevenue.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">{stats.todayOrders} orders</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Last 7 Days
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    ${stats.weekRevenue.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">{stats.weekOrders} orders</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Last 30 Days
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">
                                    ${stats.monthRevenue.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">{stats.monthOrders} orders</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    All Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${stats.totalRevenue.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">{stats.totalOrders} orders</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Key Metrics */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Average Order Value
                                </CardTitle>
                                <DollarSign className="h-5 w-5 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${stats.averageOrderValue.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Per order revenue
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Customer Rating
                                </CardTitle>
                                <Star className="h-5 w-5 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-1">
                                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                                    {stats.rating.toFixed(1)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.totalReviews} reviews
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Menu Items
                                </CardTitle>
                                <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalMenuItems}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.activeMenuItems} available
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Order Status */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Order Status Breakdown</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Pending Orders
                                </CardTitle>
                                <TrendingUp className="h-5 w-5 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {stats.pendingOrders}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Needs attention
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Completed Orders
                                </CardTitle>
                                <ShoppingBag className="h-5 w-5 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {stats.completedOrders}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Successfully delivered
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Cancelled Orders
                                </CardTitle>
                                <TrendingDown className="h-5 w-5 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {stats.cancelledOrders}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.totalOrders > 0
                                        ? `${((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1)}% of total`
                                        : '0% of total'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Performance Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                        <CardDescription>Quick overview of your restaurant's performance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-muted-foreground">Total Revenue</span>
                            <span className="font-bold text-lg">${stats.totalRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-muted-foreground">Total Orders</span>
                            <span className="font-bold text-lg">{stats.totalOrders}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-muted-foreground">Success Rate</span>
                            <span className="font-bold text-lg text-green-600">
                                {stats.totalOrders > 0
                                    ? `${((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}%`
                                    : '0%'
                                }
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-muted-foreground">Customer Satisfaction</span>
                            <span className="font-bold text-lg flex items-center gap-1">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                {stats.rating.toFixed(1)} / 5.0
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
