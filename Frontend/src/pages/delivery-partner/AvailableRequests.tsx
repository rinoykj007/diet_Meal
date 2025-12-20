import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shoppingListAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, MapPin, Calendar, DollarSign, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface ShoppingRequest {
    _id: string;
    userId: {
        fullName: string;
        phone: string;
        email: string;
    };
    items: string[];
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    deliveryFee: number;
    estimatedCost: number;
    notes?: string;
    createdAt: string;
    status: string;
}

export default function AvailableRequests() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<ShoppingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await shoppingListAPI.getAvailableRequests();
            setRequests(response.data.data || []);
        } catch (error: any) {
            // Silent fail for auto-refresh
            if (!requests.length) {
                toast({
                    title: 'Error',
                    description: 'Failed to load requests',
                    variant: 'destructive',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId: string) => {
        try {
            setAccepting(requestId);
            await shoppingListAPI.acceptRequest(requestId);

            toast({
                title: 'Success!',
                description: 'Request accepted! Go to "My Deliveries" to start.',
            });

            // Refresh the list
            fetchRequests();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to accept request';

            if (errorMessage.includes('already been accepted')) {
                toast({
                    title: 'Too Late!',
                    description: 'Someone else accepted this request first. Try another one!',
                    variant: 'destructive',
                });
                // Refresh list to remove accepted request
                fetchRequests();
            } else {
                toast({
                    title: 'Error',
                    description: errorMessage,
                    variant: 'destructive',
                });
            }
        } finally {
            setAccepting(null);
        }
    };

    return (
        <DashboardLayout role="delivery-partner">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <ShoppingCart className="w-8 h-8" />
                            Available Requests
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            First-come-first-served - Accept quickly to earn!
                        </p>
                    </div>
                    <Button onClick={fetchRequests} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {/* Alert Banner */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-900">
                        <strong>⚡ Quick Tip:</strong> Requests are first-come-first-served. Accept fast to secure the job!
                        Page auto-refreshes every 30 seconds.
                    </p>
                </div>

                {/* Requests List */}
                {loading && requests.length === 0 ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                        <p className="mt-4 text-muted-foreground">Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Requests Available</h3>
                            <p className="text-muted-foreground mb-4">
                                Check back soon! New requests will appear here.
                            </p>
                            <Button onClick={fetchRequests} variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <Card key={request._id} className="border-2 hover:border-primary transition-colors">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <ShoppingCart className="w-5 h-5" />
                                                {request.userId.fullName}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                📞 {request.userId.phone} • 📧 {request.userId.email}
                                            </p>
                                        </div>
                                        <Badge className="bg-green-500">
                                            +${request.deliveryFee} Fee
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Shopping List */}
                                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">Shopping List</h4>
                                            <Badge variant="secondary">{request.items.length} items</Badge>
                                        </div>
                                        <div className="max-h-32 overflow-y-auto">
                                            <ul className="grid grid-cols-2 gap-1 text-sm">
                                                {request.items.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-1">
                                                        <span className="text-primary mt-0.5">•</span>
                                                        <span className="text-muted-foreground">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p className="font-medium">Delivery Address:</p>
                                            <p className="text-muted-foreground">
                                                {request.deliveryAddress.street}, {request.deliveryAddress.city},{' '}
                                                {request.deliveryAddress.state} {request.deliveryAddress.zipCode}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <DollarSign className="w-4 h-4 text-green-700" />
                                            <h4 className="font-semibold text-green-900">Payment</h4>
                                        </div>
                                        <div className="text-sm text-green-800 space-y-1">
                                            <p>• Delivery Fee: <strong>${request.deliveryFee.toFixed(2)}</strong> (yours to keep!)</p>
                                            <p>• Est. Grocery Cost: ${request.estimatedCost > 0 ? request.estimatedCost.toFixed(2) : 'TBD'}</p>
                                            <p>• <strong>Cash on Delivery</strong> - Customer pays total when you deliver</p>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {request.notes && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm font-medium mb-1">Special Instructions:</p>
                                            <p className="text-sm text-muted-foreground">{request.notes}</p>
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>Requested {format(new Date(request.createdAt), 'MMM dd, yyyy hh:mm a')}</span>
                                    </div>

                                    {/* Accept Button */}
                                    <Button
                                        onClick={() => handleAccept(request._id)}
                                        disabled={accepting === request._id}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {accepting === request._id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Accepting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Accept Request - Earn ${request.deliveryFee}
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
