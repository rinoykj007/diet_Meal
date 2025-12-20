import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { orderAPI, shoppingListAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, MapPin, Calendar, DollarSign, Package, Clock, ShoppingCart, User } from 'lucide-react';
import { format } from 'date-fns';

interface OrderItem {
  dietFoodId: {
    _id: string;
    name: string;
    image?: string;
  };
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  restaurantId: {
    _id: string;
    name: string;
    address: {
      city?: string;
      state?: string;
    };
    image?: string;
  };
  items: OrderItem[];
  status: string;
  orderType: string;
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryDate?: string;
  paymentStatus: string;
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

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shoppingRequests, setShoppingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [orderType, setOrderType] = useState<'all' | 'food' | 'shopping'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [filter, orderType]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Fetch restaurant orders
      if (orderType === 'all' || orderType === 'food') {
        const params: any = { orderType: 'diet-food' };
        if (filter !== 'all') {
          params.status = filter;
        }
        const response = await orderAPI.getMyOrders(params);
        const fetchedOrders = response.data.data || [];
        // Sort by createdAt descending (newest first)
        fetchedOrders.sort((a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(fetchedOrders);
      } else {
        setOrders([]);
      }

      // Fetch shopping list requests
      if (orderType === 'all' || orderType === 'shopping') {
        const shoppingParams: any = {};
        if (filter !== 'all') {
          shoppingParams.status = filter;
        }
        const shoppingResponse = await shoppingListAPI.getMyRequests(shoppingParams);
        const fetchedRequests = shoppingResponse.data.data || [];
        // Sort by createdAt descending (newest first)
        fetchedRequests.sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setShoppingRequests(fetchedRequests);
      } else {
        setShoppingRequests([]);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await orderAPI.cancelOrder(orderId);
      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptQuote = async (orderId: string, price: number) => {
    try {
      await orderAPI.acceptQuote(orderId);
      toast({
        title: 'Success!',
        description: `Order placed! Price: $${price.toFixed(2)}`,
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to accept quote',
        variant: 'destructive',
      });
    }
  };

  const handleRejectQuote = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this quote? The order will be cancelled.')) return;

    try {
      await orderAPI.rejectQuote(orderId);
      toast({
        title: 'Quote Rejected',
        description: 'The order has been cancelled',
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject quote',
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

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Order History</h1>
          <p className="text-muted-foreground mt-1">View your past and current orders</p>
        </div>

        {/* Order Type Filter */}
        <div className="flex flex-wrap gap-2 pb-2 border-b">
          <Button
            variant={orderType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrderType('all')}
          >
            All Orders
          </Button>
          <Button
            variant={orderType === 'food' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrderType('food')}
          >
            <Package className="w-4 h-4 mr-1" />
            Restaurant Orders
          </Button>
          <Button
            variant={orderType === 'shopping' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrderType('shopping')}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Shopping Deliveries
          </Button>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Orders
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </Button>
          <Button
            variant={filter === 'preparing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('preparing')}
          >
            Preparing
          </Button>
          <Button
            variant={filter === 'out-for-delivery' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('out-for-delivery')}
          >
            Out for Delivery
          </Button>
          <Button
            variant={filter === 'delivered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('delivered')}
          >
            Delivered
          </Button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading orders...</p>
          </div>
        )}

        {!loading && orders.length === 0 && shoppingRequests.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground">Your order history will appear here</p>
            </CardContent>
          </Card>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {order.restaurantId?.name || 'Unknown Restaurant'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Order #{order._id.slice(-8).toUpperCase()} • Placed on{' '}
                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('-', ' ')}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items or Custom Recipe */}
                  {order.isCustomRecipe && order.recipeDetails ? (
                    // Custom Recipe Display
                    <div className="space-y-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500">Custom Recipe</Badge>
                        <Badge variant="secondary">{order.recipeDetails.mealType}</Badge>
                      </div>

                      <div>
                        <h4 className="font-semibold text-lg">{order.recipeDetails.recipeName}</h4>
                        <p className="text-sm text-muted-foreground">{order.recipeDetails.description}</p>
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

                      {/* Quote Status */}
                      {order.customPriceStatus === 'pending-quote' && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Waiting for restaurant to quote a price...
                          </p>
                        </div>
                      )}

                      {order.customPriceStatus === 'quoted' && order.quotedPrice && (
                        <div className="space-y-3 p-3 bg-green-50 border border-green-300 rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Price Quote Received!</p>
                              <p className="text-2xl font-bold text-green-700">
                                ${order.quotedPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            The restaurant has quoted this price for your custom recipe. Would you like to proceed?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAcceptQuote(order._id, order.quotedPrice!)}
                              className="flex-1"
                              size="sm"
                            >
                              ✅ Accept & Place Order
                            </Button>
                            <Button
                              onClick={() => handleRejectQuote(order._id)}
                              variant="outline"
                              className="flex-1"
                              size="sm"
                            >
                              ❌ Reject Quote
                            </Button>
                          </div>
                        </div>
                      )}

                      {order.customPriceStatus === 'accepted' && order.quotedPrice && (
                        <div className="p-3 bg-green-100 border border-green-300 rounded">
                          <p className="text-sm font-semibold text-green-800">
                            ✅ Quote Accepted - Order Placed at ${order.quotedPrice.toFixed(2)}
                          </p>
                        </div>
                      )}

                      {order.customPriceStatus === 'rejected' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-medium text-red-800">
                            ❌ Quote Rejected - Order Cancelled
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Regular Order Items
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Order Items:</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.dietFoodId?.image && (
                              <img
                                src={item.dietFoodId.image}
                                alt={item.dietFoodId?.name || item.name || 'Food item'}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.dietFoodId?.name || item.name || 'Unknown Item'}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Delivery Address:</p>
                          <p className="text-muted-foreground">
                            {order.deliveryAddress.street}, {order.deliveryAddress.city},{' '}
                            {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                          </p>
                        </div>
                      </div>
                      {order.deliveryDate && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Delivery Date:</p>
                            <p className="text-muted-foreground">
                              {format(new Date(order.deliveryDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Total Amount:</p>
                          <p className="text-2xl font-bold text-primary">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {order.paymentMethod && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Payment Method:</p>
                            <p className="text-muted-foreground capitalize">
                              {order.paymentMethod}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-1">Special Instructions:</p>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Shopping List Requests */}
        {!loading && shoppingRequests.length > 0 && (
          <div className="space-y-4">
            {shoppingRequests.map((request) => (
              <Card key={request._id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                        Shopping List Delivery
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Request #{request._id.slice(-8).toUpperCase()} • Created on{' '}
                        {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50">
                        {request.items.length} items
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Shopping Items */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Shopping List ({request.items.length} items)
                    </h4>
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-1 text-sm">
                      {request.items.slice(0, 12).map((item: string, idx: number) => (
                        <li key={idx} className="text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                    {request.items.length > 12 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        +{request.items.length - 12} more items...
                      </p>
                    )}
                  </div>

                  {/* Delivery Partner Info */}
                  {request.deliveryPartnerId && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 text-green-700" />
                        <div className="text-sm">
                          <p className="font-semibold text-green-900">Delivery Partner:</p>
                          <p className="text-green-800">{request.deliveryPartnerId.fullName}</p>
                          <p className="text-green-700 text-xs">{request.deliveryPartnerId.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Messages */}
                  {request.status === 'pending' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⏳ Waiting for a delivery partner to accept your request...
                      </p>
                    </div>
                  )}

                  {request.status === 'accepted' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        ✅ Delivery partner assigned and will start shopping soon!
                      </p>
                    </div>
                  )}

                  {request.status === 'in-progress' && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-800 font-medium">
                        🛒 Delivery partner is currently shopping for your items!
                      </p>
                    </div>
                  )}

                  {request.status === 'delivered' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-800">
                        <p className="font-semibold mb-2">✅ Items Delivered!</p>
                        {request.finalCost && (
                          <div className="space-y-1 mt-2 p-2 bg-green-100 rounded">
                            <p>💰 Grocery Cost: ${request.finalCost.toFixed(2)}</p>
                            <p>🚚 Delivery Fee: ${request.deliveryFee.toFixed(2)}</p>
                            <p className="font-bold border-t border-green-300 pt-1 mt-1">
                              Total Paid: ${(request.finalCost + request.deliveryFee).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Delivery Address:</p>
                          <p className="text-muted-foreground">
                            {request.deliveryAddress.street}, {request.deliveryAddress.city},{' '}
                            {request.deliveryAddress.state} {request.deliveryAddress.zipCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Delivery Fee:</p>
                          <p className="text-xl font-bold text-primary">
                            ${request.deliveryFee.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">+ grocery costs (paid on delivery)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Notes */}
                  {request.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-1">Special Instructions:</p>
                      <p className="text-sm text-muted-foreground">{request.notes}</p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                    {request.acceptedAt && (
                      <p>Accepted: {format(new Date(request.acceptedAt), 'MMM dd, yyyy HH:mm')}</p>
                    )}
                    {request.deliveredAt && (
                      <p>Delivered: {format(new Date(request.deliveredAt), 'MMM dd, yyyy HH:mm')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
