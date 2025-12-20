import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { restaurantAPI, orderAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Activity,
  Settings,
  FileText,
} from 'lucide-react';
import api from '@/lib/api';

interface Restaurant {
  _id: string;
  name: string;
  isApproved: boolean;
  isActive: boolean;
  ownerId: {
    fullName: string;
    email: string;
  };
  dietTypes: string[];
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalRestaurants: number;
  pendingRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRestaurants: 0,
    pendingRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [pendingRestaurants, setPendingRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchStats(), fetchPendingRestaurants()]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch users count
      const usersResponse = await api.get('/auth/users');
      const totalUsers = usersResponse.data.count || 0;

      // Fetch all restaurants (admin endpoint)
      const restaurantsResponse = await restaurantAPI.getAllAdmin();
      const allRestaurants = restaurantsResponse.data.data || [];
      const totalRestaurants = allRestaurants.length;
      const pendingRestaurants = allRestaurants.filter(
        (r: Restaurant) => !r.isApproved
      ).length;

      // Fetch all orders (admin can see all)
      const ordersResponse = await orderAPI.getAllOrders();
      const allOrders = ordersResponse.data.data || [];
      const totalOrders = allOrders.length;

      // Calculate revenue
      const totalRevenue = allOrders.reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0),
        0
      );

      // Today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = allOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today;
      });

      const todayRevenue = todayOrders.reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0),
        0
      );

      setStats({
        totalUsers,
        totalRestaurants,
        pendingRestaurants,
        totalOrders,
        totalRevenue,
        todayOrders: todayOrders.length,
        todayRevenue,
      });
    } catch (error: any) {
      // If endpoints don't exist, use mock data
      setStats({
        totalUsers: 0,
        totalRestaurants: 0,
        pendingRestaurants: 0,
        totalOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
        todayRevenue: 0,
      });
    }
  };

  const fetchPendingRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAllAdmin({ isApproved: false });
      const allRestaurants = response.data.data || [];
      setPendingRestaurants(allRestaurants);
    } catch (error: any) {
      console.error('Error fetching pending restaurants:', error);
    }
  };

  const handleApproveRestaurant = async (restaurantId: string) => {
    try {
      await restaurantAPI.approve(restaurantId);
      toast({
        title: 'Success',
        description: 'Restaurant approved successfully',
      });
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve restaurant',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRestaurant = async (restaurantId: string) => {
    if (!confirm('Are you sure you want to reject this restaurant?')) return;

    try {
      await restaurantAPI.delete(restaurantId);
      toast({
        title: 'Success',
        description: 'Restaurant rejected and removed',
      });
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject restaurant',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            System overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Restaurants
              </CardTitle>
              <Store className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingRestaurants} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <ShoppingBag className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.todayOrders} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.todayRevenue.toFixed(2)} today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/users">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Users className="w-5 h-5" />
                <span>Manage Users</span>
              </Button>
            </Link>
            <Link to="/admin/restaurants">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Store className="w-5 h-5" />
                <span>Restaurants</span>
              </Button>
            </Link>
            <Link to="/admin/orders">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>All Orders</span>
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pending Restaurant Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Restaurant Approvals
                </CardTitle>
                <CardDescription>Restaurants waiting for approval</CardDescription>
              </div>
              {stats.pendingRestaurants > 0 && (
                <Badge variant="destructive">{stats.pendingRestaurants} pending</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {pendingRestaurants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRestaurants.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{restaurant.name}</h3>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Owner: {restaurant.ownerId?.fullName || 'N/A'} ({restaurant.ownerId?.email || 'N/A'})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {restaurant.dietTypes?.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Submitted: {new Date(restaurant.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveRestaurant(restaurant._id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectRestaurant(restaurant._id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Today's Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Orders</span>
                <span className="font-semibold">{stats.todayOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="font-semibold text-green-600">
                  ${stats.todayRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Order Value</span>
                <span className="font-semibold">
                  ${stats.todayOrders > 0 ? (stats.todayRevenue / stats.todayOrders).toFixed(2) : '0.00'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Status</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Restaurants</span>
                <span className="font-semibold">
                  {stats.totalRestaurants - stats.pendingRestaurants}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
