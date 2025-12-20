import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { restaurantAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Store,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  User,
} from 'lucide-react';

interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  isApproved: boolean;
  isActive: boolean;
  ownerId: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  dietTypes: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  rating?: number;
  createdAt: string;
}

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'inactive'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    let filtered = [...restaurants];

    // Filter by status
    if (filterStatus === 'approved') {
      filtered = filtered.filter((r) => r.isApproved && r.isActive);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter((r) => !r.isApproved);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((r) => !r.isActive);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ownerId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ownerId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, filterStatus, restaurants]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getAllAdmin();
      setRestaurants(response.data.data || []);
      setFilteredRestaurants(response.data.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch restaurants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (restaurantId: string) => {
    try {
      await restaurantAPI.approve(restaurantId);
      toast({
        title: 'Success',
        description: 'Restaurant approved successfully',
      });
      fetchRestaurants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve restaurant',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (restaurantId: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      await restaurantAPI.delete(restaurantId);
      toast({
        title: 'Success',
        description: 'Restaurant deleted successfully',
      });
      fetchRestaurants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete restaurant',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (restaurant: Restaurant) => {
    if (!restaurant.isApproved) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pending Approval
        </Badge>
      );
    }
    if (!restaurant.isActive) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
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
            <Store className="h-8 w-8" />
            Restaurant Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all diet restaurants
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restaurants.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved & Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {restaurants.filter((r) => r.isApproved && r.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {restaurants.filter((r) => !r.isApproved).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {restaurants.filter((r) => !r.isActive).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants, owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
              >
                Approved & Active
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                Pending Approval
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Restaurants List */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurants ({filteredRestaurants.length})</CardTitle>
            <CardDescription>List of all restaurants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRestaurants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No restaurants found
                </div>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    className="flex flex-col md:flex-row md:items-start justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                        {getStatusBadge(restaurant)}
                      </div>

                      {restaurant.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {restaurant.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {restaurant.dietTypes?.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Owner: {restaurant.ownerId?.fullName || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {restaurant.ownerId?.email || restaurant.email || 'N/A'}
                        </div>
                        {(restaurant.phone || restaurant.ownerId?.phone) && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {restaurant.phone || restaurant.ownerId?.phone}
                          </div>
                        )}
                        {restaurant.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {[
                              restaurant.address.street,
                              restaurant.address.city,
                              restaurant.address.state,
                              restaurant.address.zipCode,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        )}
                        <div className="text-xs">
                          Registered: {new Date(restaurant.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[120px]">
                      {!restaurant.isApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(restaurant._id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(restaurant._id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
