import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { shoppingListAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Package, MapPin, ShoppingCart, Truck, CheckCircle, Loader2, Eye, User, Phone, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function MyDeliveries() {
    const { toast } = useToast();
    const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
    const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [finalCosts, setFinalCosts] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            // Fetch active deliveries (in-progress)
            const activeResponse = await shoppingListAPI.getMyDeliveries({ status: 'in-progress' });
            setActiveDeliveries(activeResponse.data.data || []);

            // Fetch completed deliveries (delivered status only)
            const completedResponse = await shoppingListAPI.getMyDeliveries();
            const allDeliveries = completedResponse.data.data || [];
            const completed = allDeliveries.filter((d: any) => d.status === 'delivered');
            setCompletedDeliveries(completed);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load deliveries',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            setUpdatingStatus(id);
            const finalCost = status === 'delivered' ? parseFloat(finalCosts[id] || '0') : undefined;

            await shoppingListAPI.updateStatus(id, status, finalCost);

            toast({
                title: 'Success',
                description: `Status updated to ${status}`,
            });

            fetchDeliveries();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update status',
                variant: 'destructive',
            });
        } finally {
            setUpdatingStatus(null);
        }
    };

    return (
        <DashboardLayout role="delivery-partner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Truck className="w-8 h-8" />
                        My Deliveries
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your ongoing and completed deliveries
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto" />
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="active">
                                Active ({activeDeliveries.length})
                            </TabsTrigger>
                            <TabsTrigger value="completed">
                                Completed ({completedDeliveries.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="active" className="space-y-4">
                            {activeDeliveries.length === 0 ? (
                                <Card className="text-center py-12">
                                    <CardContent>
                                        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Active Deliveries</h3>
                                        <p className="text-muted-foreground">
                                            Accept requests to start earning!
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[100px]">Request ID</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Delivery Address</TableHead>
                                            <TableHead>Delivery Fee</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Started At</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeDeliveries.map((delivery) => (
                                            <TableRow key={delivery._id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono text-xs">
                                                    #{delivery._id.slice(-6).toUpperCase()}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-medium">{delivery.userId.fullName}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Phone className="w-3 h-3" />
                                                            {delivery.userId.phone || 'N/A'}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{delivery.userId.email}</p>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="w-3 h-3 mr-1" />
                                                                {delivery.items.length} items
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Shopping List ({delivery.items.length} items)</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="max-h-96 overflow-y-auto">
                                                                <ul className="grid grid-cols-2 gap-2">
                                                                    {delivery.items.map((item: string, idx: number) => (
                                                                        <li key={idx} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                                                                            <ShoppingCart className="w-3 h-3 text-primary" />
                                                                            {item}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="max-w-[200px]">
                                                        <div className="flex items-start gap-1 text-sm">
                                                            <MapPin className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                                                            <span className="text-xs leading-tight">
                                                                {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state} {delivery.deliveryAddress.zipCode}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="font-semibold text-green-600">
                                                        ${delivery.deliveryFee.toFixed(2)}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge className="bg-purple-500 animate-pulse">
                                                        🛒 Shopping
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-xs text-muted-foreground">
                                                    {delivery.acceptedAt
                                                        ? format(new Date(delivery.acceptedAt), 'MMM dd, HH:mm')
                                                        : '-'
                                                    }
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Complete
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Complete Delivery</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4 pt-4">
                                                                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                                                    <p className="text-sm font-semibold text-blue-900 mb-1">Customer: {delivery.userId.fullName}</p>
                                                                    <p className="text-xs text-blue-700">Your delivery fee: ${delivery.deliveryFee.toFixed(2)}</p>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label className="text-base font-semibold">Enter Final Grocery Cost</Label>
                                                                    <p className="text-xs text-muted-foreground mb-2">
                                                                        Total amount customer will pay for groceries
                                                                    </p>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                        value={finalCosts[delivery._id] || ''}
                                                                        onChange={(e) => setFinalCosts({
                                                                            ...finalCosts,
                                                                            [delivery._id]: e.target.value
                                                                        })}
                                                                        className="text-lg font-semibold"
                                                                    />
                                                                </div>

                                                                {finalCosts[delivery._id] && (
                                                                    <div className="p-3 bg-green-50 border border-green-200 rounded space-y-1">
                                                                        <div className="flex justify-between text-sm">
                                                                            <span>Grocery Cost:</span>
                                                                            <span className="font-semibold">${parseFloat(finalCosts[delivery._id]).toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-sm">
                                                                            <span>Delivery Fee:</span>
                                                                            <span className="font-semibold">${delivery.deliveryFee.toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-base font-bold border-t border-green-300 pt-1 mt-1">
                                                                            <span>Customer Pays Total:</span>
                                                                            <span className="text-green-700">
                                                                                ${(parseFloat(finalCosts[delivery._id]) + delivery.deliveryFee).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <Button
                                                                    onClick={() => handleUpdateStatus(delivery._id, 'delivered')}
                                                                    disabled={updatingStatus === delivery._id || !finalCosts[delivery._id]}
                                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                                    Mark as Delivered
                                                                </Button>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="completed" className="space-y-4">
                            {completedDeliveries.length === 0 ? (
                                <Card className="text-center py-12">
                                    <CardContent>
                                        <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Completed Deliveries</h3>
                                        <p className="text-muted-foreground">
                                            Your completed deliveries will appear here
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead className="w-[100px]">Request ID</TableHead>
                                                        <TableHead>Customer</TableHead>
                                                        <TableHead>Items</TableHead>
                                                        <TableHead>Delivery Address</TableHead>
                                                        <TableHead>Payment</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Completed Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {completedDeliveries.map((delivery) => (
                                                        <TableRow key={delivery._id} className="hover:bg-muted/30">
                                                            <TableCell className="font-mono text-xs">
                                                                #{delivery._id.slice(-6).toUpperCase()}
                                                            </TableCell>

                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                                    <span className="font-medium">{delivery.userId.fullName}</span>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="outline" size="sm">
                                                                            <Eye className="w-3 h-3 mr-1" />
                                                                            {delivery.items.length} items
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-2xl">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Shopping List ({delivery.items.length} items)</DialogTitle>
                                                                        </DialogHeader>
                                                                        <div className="max-h-96 overflow-y-auto">
                                                                            <ul className="grid grid-cols-2 gap-2">
                                                                                {delivery.items.map((item: string, idx: number) => (
                                                                                    <li key={idx} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                                                                                        <ShoppingCart className="w-3 h-3 text-primary" />
                                                                                        {item}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </TableCell>

                                                            <TableCell>
                                                                <div className="max-w-[200px]">
                                                                    <div className="flex items-start gap-1 text-sm">
                                                                        <MapPin className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                                                                        <span className="text-xs leading-tight">
                                                                            {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state} {delivery.deliveryAddress.zipCode}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell>
                                                                <div className="space-y-1">
                                                                    <div className="flex justify-between items-center gap-4 text-xs">
                                                                        <span className="text-muted-foreground">Groceries:</span>
                                                                        <span className="font-medium">${delivery.finalCost ? delivery.finalCost.toFixed(2) : '0.00'}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center gap-4 text-xs">
                                                                        <span className="text-muted-foreground">Delivery Fee:</span>
                                                                        <span className="font-semibold text-green-600">${delivery.deliveryFee.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center gap-4 pt-1 border-t">
                                                                        <span className="font-bold text-sm">Total:</span>
                                                                        <span className="font-bold text-sm">${((delivery.finalCost || 0) + delivery.deliveryFee).toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="text-xs text-center pt-1">
                                                                        {delivery.paymentStatus === 'paid' ? (
                                                                            <span className="text-green-600 font-semibold">✓ Paid</span>
                                                                        ) : (
                                                                            <span className="text-orange-600">Pending</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell>
                                                                <Badge className={
                                                                    delivery.deliveryConfirmed
                                                                        ? 'bg-green-500'
                                                                        : 'bg-orange-500'
                                                                }>
                                                                    {delivery.deliveryConfirmed ? '✓ Payment Confirmed' : '📦 Delivered'}
                                                                </Badge>
                                                            </TableCell>

                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {delivery.deliveredAt
                                                                    ? format(new Date(delivery.deliveredAt), 'MMM dd, yyyy HH:mm')
                                                                    : '-'
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </DashboardLayout>
    );
}
