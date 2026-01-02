import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orderAPI, shoppingListAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Calendar, DollarSign, Clock, ShoppingCart, User, Eye, Store } from 'lucide-react';
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
          // For 'delivered' filter, include both 'delivered' and 'confirmed' (legacy data)
          if (filter === 'delivered') {
            shoppingParams.status = 'delivered,confirmed';
          } else {
            shoppingParams.status = filter;
          }
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

  const handleConfirmDelivery = async (requestId: string) => {
    try {
      await shoppingListAPI.confirmDelivery(requestId);
      toast({
        title: 'Delivery Confirmed',
        description: 'Thank you for confirming the delivery!',
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to confirm delivery',
        variant: 'destructive',
      });
    }
  };

  const handleDisputeDelivery = async (requestId: string) => {
    const reason = prompt('Please describe the issue with your delivery:');
    if (!reason || reason.trim().length === 0) {
      toast({
        title: 'Cancelled',
        description: 'Dispute cancelled - no reason provided',
        variant: 'destructive',
      });
      return;
    }

    try {
      await shoppingListAPI.disputeDelivery(requestId, reason);
      toast({
        title: 'Dispute Reported',
        description: 'We will investigate the issue and contact you soon',
        variant: 'destructive',
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to report dispute',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      accepted: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      'out-for-delivery': 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-orange-100 text-orange-800',
      disputed: 'bg-red-100 text-red-800',
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

  // Helper function to get display status for shopping list
  const getShoppingListDisplayStatus = (request: any) => {
    // For shopping lists, show 'delivered' even if status is 'confirmed' (legacy data)
    if (request.status === 'confirmed') {
      return 'delivered';
    }
    return request.status;
  };

  // Dynamic filter options based on order type
  const getFilterOptions = () => {
    if (orderType === 'shopping') {
      return ['all', 'pending', 'delivered', 'disputed', 'cancelled'];
    } else if (orderType === 'food') {
      return ['all', 'pending', 'confirmed', 'delivered', 'cancelled'];
    } else {
      // All orders - show union of both
      return ['all', 'pending', 'confirmed', 'delivered', 'disputed', 'cancelled'];
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Order History</h1>
          <p className="text-muted-foreground mt-1">View your past and current orders</p>
        </div>

        {/* Tabs for Order Type */}
        <Tabs value={orderType} onValueChange={(value) => {
          setOrderType(value as any);
          setFilter('all'); // Reset filter when switching tabs
        }} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="food">
              <Store className="w-4 h-4 mr-1" />
              Restaurant
            </TabsTrigger>
            <TabsTrigger value="shopping">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Shopping
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Status Filter Chips - Dynamic based on selected order type */}
        <div className="flex flex-wrap gap-2">
          {getFilterOptions().map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status === 'all' ? 'All Status' : status.replace(/-/g, ' ')}
            </Button>
          ))}
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

        {/* Restaurant Orders Table */}
        {!loading && orders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Restaurant Orders
              </CardTitle>
              <CardDescription>Your food orders from restaurants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Delivery Address</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs">
                          #{order._id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.restaurantId?.name || 'Unknown'}</div>
                          {order.isCustomRecipe && (
                            <Badge className="bg-orange-500 mt-1">Custom Recipe</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Eye className="h-4 w-4" />
                                View Items
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Order Items - #{order._id.slice(-8).toUpperCase()}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
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
                                            Accept & Place Order
                                          </Button>
                                          <Button
                                            onClick={() => handleRejectQuote(order._id)}
                                            variant="outline"
                                            className="flex-1"
                                            size="sm"
                                          >
                                            Reject Quote
                                          </Button>
                                        </div>
                                      </div>
                                    )}

                                    {order.customPriceStatus === 'accepted' && order.quotedPrice && (
                                      <div className="p-3 bg-green-100 border border-green-300 rounded">
                                        <p className="text-sm font-semibold text-green-800">
                                          Quote Accepted - Order Placed at ${order.quotedPrice.toFixed(2)}
                                        </p>
                                      </div>
                                    )}

                                    {order.customPriceStatus === 'rejected' && (
                                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                                        <p className="text-sm font-medium text-red-800">
                                          Quote Rejected - Order Cancelled
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  // Regular Order Items
                                  <div className="space-y-2">
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

                                {/* Additional Details */}
                                <div className="space-y-2 pt-4 border-t">
                                  {order.deliveryDate && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">Delivery Date:</span>
                                      <span className="text-muted-foreground">
                                        {format(new Date(order.deliveryDate), 'MMM dd, yyyy')}
                                      </span>
                                    </div>
                                  )}
                                  {order.paymentMethod && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">Payment Method:</span>
                                      <span className="text-muted-foreground capitalize">{order.paymentMethod}</span>
                                    </div>
                                  )}
                                  {order.notes && (
                                    <div className="text-sm">
                                      <p className="font-medium mb-1">Special Instructions:</p>
                                      <p className="text-muted-foreground">{order.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-[200px]">
                            {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-primary">
                            ${order.totalAmount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelOrder(order._id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shopping List Requests Table */}
        {!loading && shoppingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping List Deliveries
              </CardTitle>
              <CardDescription>Your shopping list delivery requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Delivery Address</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shoppingRequests.map((request) => (
                      <TableRow key={request._id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs">
                          #{request._id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-1">
                                <ShoppingCart className="h-4 w-4" />
                                {request.items.length} items
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Shopping List - #{request._id.slice(-8).toUpperCase()}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    Shopping List ({request.items.length} items)
                                  </h4>
                                  <ul className="grid grid-cols-2 gap-1 text-sm">
                                    {request.items.map((item: string, idx: number) => (
                                      <li key={idx} className="text-muted-foreground">• {item}</li>
                                    ))}
                                  </ul>
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

                                {/* Cost Breakdown if available */}
                                {request.finalCost && (
                                  <div className="space-y-1 p-3 bg-white border border-gray-200 rounded">
                                    <p className="text-sm">Grocery Cost: ${request.finalCost.toFixed(2)}</p>
                                    <p className="text-sm">Delivery Fee: ${request.deliveryFee.toFixed(2)}</p>
                                    <p className="font-bold border-t border-gray-300 pt-1 mt-1">
                                      Total: ${(request.finalCost + request.deliveryFee).toFixed(2)}
                                    </p>
                                  </div>
                                )}

                                {/* Special Notes */}
                                {request.notes && (
                                  <div className="pt-2 border-t">
                                    <p className="text-sm font-medium mb-1">Special Instructions:</p>
                                    <p className="text-sm text-muted-foreground">{request.notes}</p>
                                  </div>
                                )}

                                {/* Timestamps */}
                                <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                                  {request.acceptedAt && (
                                    <p>Accepted: {format(new Date(request.acceptedAt), 'MMM dd, yyyy HH:mm')}</p>
                                  )}
                                  {request.deliveredAt && (
                                    <p>Delivered: {format(new Date(request.deliveredAt), 'MMM dd, yyyy HH:mm')}</p>
                                  )}
                                  {request.deliveryConfirmedAt && (
                                    <p>Confirmed: {format(new Date(request.deliveryConfirmedAt), 'MMM dd, yyyy HH:mm')}</p>
                                  )}
                                  {request.disputedAt && (
                                    <p>Disputed: {format(new Date(request.disputedAt), 'MMM dd, yyyy HH:mm')}</p>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-[200px]">
                            {request.deliveryAddress.street}, {request.deliveryAddress.city}, {request.deliveryAddress.state} {request.deliveryAddress.zipCode}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-primary">
                            ${request.deliveryFee.toFixed(2)}
                          </div>
                          {request.finalCost && (
                            <div className="text-xs text-muted-foreground">
                              +${request.finalCost.toFixed(2)} groceries
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getStatusColor(getShoppingListDisplayStatus(request))}>
                              {getShoppingListDisplayStatus(request)}
                            </Badge>
                            {/* Status-specific messages */}
                            {(request.status === 'delivered' || request.status === 'confirmed') && !request.deliveryConfirmed && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-orange-600">
                                    Action Required
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delivery Confirmation Required</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg space-y-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-xl">
                                          📦
                                        </div>
                                        <div>
                                          <p className="font-bold text-orange-900">Delivery Partner Marked as Delivered</p>
                                          <p className="text-sm text-orange-800">
                                            Please confirm if you received your items
                                          </p>
                                        </div>
                                      </div>

                                      {request.finalCost && (
                                        <div className="space-y-1 p-3 bg-white border border-orange-200 rounded">
                                          <p className="text-sm">Grocery Cost: ${request.finalCost.toFixed(2)}</p>
                                          <p className="text-sm">Delivery Fee: ${request.deliveryFee.toFixed(2)}</p>
                                          <p className="font-bold border-t border-orange-300 pt-1 mt-1">
                                            Total: ${(request.finalCost + request.deliveryFee).toFixed(2)}
                                          </p>
                                        </div>
                                      )}

                                      <div className="flex gap-3 pt-2">
                                        <Button
                                          onClick={() => {
                                            handleConfirmDelivery(request._id);
                                          }}
                                          className="flex-1 bg-green-600 hover:bg-green-700"
                                          size="sm"
                                        >
                                          Yes, I Received It
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            handleDisputeDelivery(request._id);
                                          }}
                                          variant="destructive"
                                          className="flex-1"
                                          size="sm"
                                        >
                                          Report Issue
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            {(request.status === 'delivered' || request.status === 'confirmed') && request.deliveryConfirmed && (
                              <div className="text-xs text-green-700">Payment confirmed</div>
                            )}
                            {request.status === 'disputed' && request.disputeReason && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-red-600">
                                    View Dispute
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Dispute Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="p-4 bg-red-50 border-2 border-red-400 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-xl">
                                        ⚠️
                                      </div>
                                      <div>
                                        <p className="font-bold text-red-900">Delivery Disputed</p>
                                        <p className="text-sm text-red-800">
                                          Issue reported - Under investigation
                                        </p>
                                      </div>
                                    </div>
                                    <div className="p-3 bg-white border border-red-300 rounded">
                                      <p className="text-xs font-semibold text-red-900 mb-1">Your Report:</p>
                                      <p className="text-sm text-red-800">{request.disputeReason}</p>
                                      {request.disputedAt && (
                                        <p className="text-xs text-red-700 mt-2">
                                          Reported on {format(new Date(request.disputedAt), 'MMM dd, yyyy \'at\' HH:mm')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {request.status === 'delivered' && !request.deliveryConfirmed && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleConfirmDelivery(request._id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirm
                              </Button>
                              <Button
                                onClick={() => handleDisputeDelivery(request._id)}
                                variant="destructive"
                                size="sm"
                              >
                                Dispute
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
