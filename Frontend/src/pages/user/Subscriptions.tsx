import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function Subscriptions() {
  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">My Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Manage your active meal plan subscriptions</p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active subscriptions</h3>
            <p className="text-muted-foreground">Subscribe to a meal plan to get started!</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
