import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Salad,
  CalendarDays,
  History,
  User,
  Bell,
  CreditCard,
  Menu,
  X,
  LogOut,
  ChefHat,
  Settings,
  Users,
  FileText,
  Brain,
  ShoppingCart,
  UtensilsCrossed
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'user' | 'provider' | 'admin' | 'restaurant';
}

const userNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Diet Selection', href: '/ai-diet', icon: Brain },
  { label: 'Meal Plans', href: '/meal-plans', icon: Salad },
  { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { label: 'Order History', href: '/orders', icon: History },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Notifications', href: '/notifications', icon: Bell },
];

const providerNavItems = [
  { label: 'Dashboard', href: '/provider/dashboard', icon: LayoutDashboard },
  { label: 'Diet Plans', href: '/provider/diet-plans', icon: Salad },
  { label: 'Meals & Nutrition', href: '/provider/meals', icon: ChefHat },
  { label: 'Availability', href: '/provider/availability', icon: CalendarDays },
  { label: 'Orders', href: '/provider/orders', icon: ShoppingCart },
  { label: 'Subscriptions', href: '/provider/subscriptions', icon: CreditCard },
  { label: 'Profile', href: '/provider/profile', icon: User },
];

const restaurantNavItems = [
  { label: 'Dashboard', href: '/restaurant/dashboard', icon: LayoutDashboard },
  { label: 'Menu Management', href: '/restaurant/menu', icon: UtensilsCrossed },
  { label: 'Orders', href: '/restaurant/orders', icon: ShoppingCart },
  { label: 'Restaurant Info', href: '/restaurant/profile', icon: ChefHat },
  { label: 'Analytics', href: '/restaurant/analytics', icon: Settings },
];

const adminNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Restaurants', href: '/admin/restaurants', icon: ChefHat },
  { label: 'Diet Plans', href: '/admin/diet-plans', icon: Salad },
  { label: 'AI Rules', href: '/admin/ai-rules', icon: Brain },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'CMS', href: '/admin/cms', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const navItems = role === 'admin' ? adminNavItems : role === 'provider' ? providerNavItems : role === 'restaurant' ? restaurantNavItems : userNavItems;
  const title = role === 'admin' ? 'Admin Panel' : role === 'provider' ? 'Provider Panel' : role === 'restaurant' ? 'Restaurant Dashboard' : 'My Account';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
        <span className="font-heading font-bold text-lg">{title}</span>
        <div className="w-10" />
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Salad className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">NutriPlan</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
