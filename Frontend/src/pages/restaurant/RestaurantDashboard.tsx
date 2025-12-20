import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { restaurantAPI, orderAPI, dietFoodAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Store,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  UtensilsCrossed,
  Package,
  Star,
  AlertCircle,
} from 'lucide-react';

interface Restaurant {
  _id: string;
  name: string;
  isApproved: boolean;
  isActive: boolean;
  rating: number;
  totalReviews: number;
}

interface Order {
  _id: string;
  userId: {
    fullName: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
  };
  createdAt: string;
}

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    totalMenuItems: 0,
    activeMenuItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchRestaurantInfo(),
        fetchOrders(),
        fetchMenuStats(),
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantInfo = async () => {
    try {
      const response = await restaurantAPI.getMyRestaurant();
      setRestaurant(response.data.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast({
          title: 'No Restaurant Found',
          description: 'Please register your restaurant first',
          variant: 'destructive',
        });
      }
    }
  };

  const fetchOrders = async () => {
    try {
      if (!restaurant?._id) return;

      const response = await orderAPI.getRestaurantOrders(restaurant._id);
      const orders = response.data.data || [];

      setRecentOrders(orders.slice(0, 5));

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter((order: Order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today;
      });

      const todayRevenue = todayOrders.reduce(
        (sum: number, order: Order) => sum + order.totalAmount,
        0
      );

      const pendingOrders = orders.filter(
        (order: Order) => order.status === 'pending' || order.status === 'confirmed'
      ).length;

      setStats((prev) => ({
        ...prev,
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingOrders,
      }));
    } catch (error: any) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchMenuStats = async () => {
    try {
      if (!restaurant?._id) return;

      const response = await dietFoodAPI.getByRestaurant(restaurant._id);
      const menuItems = response.data.data || [];

      const activeItems = menuItems.filter((item: any) => item.isAvailable).length;

      setStats((prev) => ({
        ...prev,
        totalMenuItems: menuItems.length,
        activeMenuItems: activeItems,
      }));
    } catch (error: any) {
      console.error('Error fetching menu stats:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      'out-for-delivery': 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
        <div className="space-y-6">
          <Card className="text-center py-12">
            <CardContent>
              <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Restaurant Registered</h3>
              <p className="text-muted-foreground mb-6">
                You need to register your restaurant to access the dashboard
              </p>
              <Link to="/restaurant/register">
                <Button>Register Restaurant</Button>
              </Link>
            </CardContent>
          </Card>
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
              {restaurant.name}
            </h1>
            <p className="text-muted-foreground mt-1">Restaurant Owner Dashboard</p>
          </div>
          <div className="flex gap-2">
            {!restaurant.isApproved && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Pending Approval
              </Badge>
            )}
            {restaurant.isApproved && restaurant.isActive && (
              <Badge variant="default" className="flex items-center gap-1 bg-green-500">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">
                ({restaurant.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Orders
              </CardTitle>
              <ShoppingBag className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Revenue
              </CardTitle>
              <DollarSign className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Net earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Menu Items
              </CardTitle>
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMenuItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeMenuItems} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Orders
              </CardTitle>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your restaurant efficiently</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/restaurant/menu">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <UtensilsCrossed className="w-5 h-5" />
                <span>Manage Menu</span>
              </Button>
            </Link>
            <Link to="/restaurant/orders">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Package className="w-5 h-5" />
                <span>All Orders</span>
              </Button>
            </Link>
            <Link to="/restaurant/profile">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Store className="w-5 h-5" />
                <span>Restaurant Info</span>
              </Button>
            </Link>
            <Link to="/restaurant/analytics">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold">{order.userId.fullName}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {order.items.length} item(s) • ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order._id, 'preparing')}
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateOrderStatus(order._id, 'out-for-delivery')
                          }
                        >
                          Out for Delivery
                        </Button>
                      )}
                      {order.status === 'out-for-delivery' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
