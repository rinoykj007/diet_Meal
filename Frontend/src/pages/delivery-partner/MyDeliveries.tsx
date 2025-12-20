import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shoppingListAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Package, MapPin, ShoppingCart, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function MyDeliveries() {
    const { toast } = useToast();
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [finalCosts, setFinalCosts] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const response = await shoppingListAPI.getMyDeliveries({ status: 'accepted,in-progress' });
            setDeliveries(response.data.data || []);
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
                        My Active Deliveries
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your ongoing deliveries
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto" />
                    </div>
                ) : deliveries.length === 0 ? (
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
                    <div className="space-y-4">
                        {deliveries.map((delivery) => (
                            <Card key={delivery._id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{delivery.userId.fullName}</CardTitle>
                                        <Badge className={
                                            delivery.status === 'accepted' ? 'bg-yellow-500' : 'bg-blue-500'
                                        }>
                                            {delivery.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <h4 className="font-semibold mb-2">Shopping List ({delivery.items.length} items)</h4>
                                        <ul className="grid grid-cols-2 gap-1 text-sm">
                                            {delivery.items.map((item: string, idx: number) => (
                                                <li key={idx}>• {item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-medium">Delivery Address:</p>
                                            <p className="text-muted-foreground">
                                                {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city},{' '}
                                                {delivery.deliveryAddress.state} {delivery.deliveryAddress.zipCode}
                                            </p>
                                        </div>
                                    </div>

                                    {delivery.status === 'accepted' && (
                                        <Button
                                            onClick={() => handleUpdateStatus(delivery._id, 'in-progress')}
                                            disabled={updatingStatus === delivery._id}
                                            className="w-full"
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Start Shopping
                                        </Button>
                                    )}

                                    {delivery.status === 'in-progress' && (
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label>Final Grocery Cost (total paid)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Enter actual cost"
                                                    value={finalCosts[delivery._id] || ''}
                                                    onChange={(e) => setFinalCosts({
                                                        ...finalCosts,
                                                        [delivery._id]: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <Button
                                                onClick={() => handleUpdateStatus(delivery._id, 'delivered')}
                                                disabled={updatingStatus === delivery._id || !finalCosts[delivery._id]}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Mark as Delivered
                                            </Button>
                                            <p className="text-xs text-center text-muted-foreground">
                                                You'll earn ${delivery.deliveryFee} + collect grocery costs
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
