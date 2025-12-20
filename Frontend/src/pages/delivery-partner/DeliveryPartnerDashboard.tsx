import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { shoppingListAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
    Truck,
    Package,
    DollarSign,
    Clock,
    CheckCircle,
    ShoppingCart
} from 'lucide-react';

export default function DeliveryPartnerDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [stats, setStats] = useState({
        availableRequests: 0,
        activeDeliveries: 0,
        completedToday: 0,
        totalEarnings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // Fetch available requests
            const availableRes = await shoppingListAPI.getAvailableRequests();
            const available = availableRes.data.data || [];

            // Fetch my deliveries
            const myDeliveriesRes = await shoppingListAPI.getMyDeliveries();
            const myDeliveries = myDeliveriesRes.data.data || [];

            // Calculate stats
            const active = myDeliveries.filter((d: any) =>
                d.status === 'accepted' || d.status === 'in-progress'
            );

            const completedToday = myDeliveries.filter((d: any) => {
                if (d.status !== 'delivered') return false;
                const deliveredDate = new Date(d.deliveredAt || d.updatedAt);
                const today = new Date();
                return deliveredDate.toDateString() === today.toDateString();
            });

            const delivered = myDeliveries.filter((d: any) => d.status === 'delivered');
            const totalEarnings = delivered.length * 10; // $10 per delivery

            setStats({
                availableRequests: available.length,
                activeDeliveries: active.length,
                completedToday: completedToday.length,
                totalEarnings
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to load dashboard stats',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="delivery-partner">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Truck className="w-8 h-8" />
                        Delivery Partner Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your deliveries and track earnings
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Available Requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">{stats.availableRequests}</div>
                                <ShoppingCart className="w-8 h-8 text-blue-500" />
                            </div>
                            <Button
                                className="w-full mt-4"
                                onClick={() => navigate('/delivery-partner/requests')}
                            >
                                View Requests
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Active Deliveries</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold text-orange-600">{stats.activeDeliveries}</div>
                                <Package className="w-8 h-8 text-orange-500" />
                            </div>
                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => navigate('/delivery-partner/deliveries')}
                            >
                                Manage
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Completed Today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold text-green-600">{stats.completedToday}</div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Earnings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold text-green-700">${stats.totalEarnings}</div>
                                <DollarSign className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                $10 per delivery completed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            onClick={() => navigate('/delivery-partner/requests')}
                            className="h-20"
                        >
                            <div className="text-center">
                                <ShoppingCart className="w-6 h-6 mx-auto mb-1" />
                                <div className="text-sm">Browse Requests</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate('/delivery-partner/deliveries')}
                            className="h-20"
                        >
                            <div className="text-center">
                                <Truck className="w-6 h-6 mx-auto mb-1" />
                                <div className="text-sm">My Deliveries</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate('/delivery-partner/history')}
                            className="h-20"
                        >
                            <div className="text-center">
                                <Clock className="w-6 h-6 mx-auto mb-1" />
                                <div className="text-sm">History</div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-900">How It Works</CardTitle>
                    </CardHeader>
                    <CardContent className="text-blue-800">
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Browse available shopping list requests from customers</li>
                            <li>Accept a request (first-come-first-served)</li>
                            <li>Purchase the items from local stores</li>
                            <li>Deliver to the customer's address</li>
                            <li>Collect $10 delivery fee + actual grocery costs in cash</li>
                            <li>Mark as delivered and earn your fee!</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
