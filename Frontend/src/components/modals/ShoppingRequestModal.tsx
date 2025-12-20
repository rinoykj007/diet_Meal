import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { shoppingListAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, MapPin, DollarSign, Truck, Loader2 } from 'lucide-react';

interface ShoppingRequestModalProps {
    open: boolean;
    onClose: () => void;
    mealPlanId: string;
    shoppingList: string[];
}

export default function ShoppingRequestModal({
    open,
    onClose,
    mealPlanId,
    shoppingList
}: ShoppingRequestModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [deliveryAddress, setDeliveryAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
    });

    const [estimatedCost, setEstimatedCost] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
            toast({
                title: 'Error',
                description: 'Please fill in all delivery address fields',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoading(true);

            const requestData = {
                mealPlanId,
                items: shoppingList,
                deliveryAddress,
                estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
                notes
            };

            console.log('Sending shopping request:', requestData);

            await shoppingListAPI.createRequest(requestData);

            toast({
                title: 'Success!',
                description: 'Shopping list request sent to delivery partners. You\'ll be notified when someone accepts!',
            });

            // Reset form
            setDeliveryAddress({
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'USA'
            });
            setEstimatedCost('');
            setNotes('');

            onClose();
        } catch (error: any) {
            console.error('Shopping request error:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to send request';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Request Shopping List Delivery
                    </DialogTitle>
                    <DialogDescription>
                        Get all your meal plan items delivered by a delivery partner
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Shopping List Summary */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Your Shopping List</h3>
                            <Badge>{shoppingList.length} items</Badge>
                        </div>
                        <div className="max-h-32 overflow-y-auto">
                            <ul className="grid grid-cols-2 gap-1 text-sm">
                                {shoppingList.map((item, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                        <span className="text-primary mt-1">•</span>
                                        <span className="text-muted-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Pricing Info */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-700" />
                            <p className="font-semibold text-green-900">Pricing Information</p>
                        </div>
                        <div className="text-sm space-y-1 text-green-800">
                            <p>• Fixed Delivery Fee: <span className="font-bold">$10.00</span></p>
                            <p>• Item Costs: Actual grocery prices (estimated by you, paid on delivery)</p>
                            <p>• Payment Method: <span className="font-bold">Cash on Delivery</span></p>
                        </div>
                    </div>

                    {/* Estimated Item Cost */}
                    <div className="space-y-2">
                        <Label htmlFor="estimatedCost">Estimated Grocery Cost (Optional)</Label>
                        <Input
                            id="estimatedCost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={estimatedCost}
                            onChange={(e) => setEstimatedCost(e.target.value)}
                            placeholder="e.g. 50.00"
                        />
                        <p className="text-xs text-muted-foreground">
                            Rough estimate of grocery costs. Final amount will be confirmed by delivery partner.
                        </p>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <Label className="text-base font-semibold">Delivery Address</Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="street">Street Address *</Label>
                            <Input
                                id="street"
                                value={deliveryAddress.street}
                                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                                placeholder="123 Main St, Apt 4B"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    value={deliveryAddress.city}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                                    placeholder="New York"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input
                                    id="state"
                                    value={deliveryAddress.state}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                                    placeholder="NY"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">ZIP Code *</Label>
                                <Input
                                    id="zipCode"
                                    value={deliveryAddress.zipCode}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                                    placeholder="10001"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={deliveryAddress.country}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                                    placeholder="USA"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Special Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Special Instructions (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Brand preferences, substitutions allowed, delivery time preference..."
                            rows={3}
                        />
                    </div>

                    {/* Info Note */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 mt-0.5 text-blue-700" />
                            <div className="text-sm text-blue-900">
                                <p className="font-semibold mb-1">How it works:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Your request is sent to all available delivery partners</li>
                                    <li>First partner to accept gets the job (first-come-first-served)</li>
                                    <li>They'll purchase and deliver your items</li>
                                    <li>Pay cash on delivery: $10 delivery fee + actual grocery costs</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Send Request
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
