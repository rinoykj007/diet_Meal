import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Plans from "./pages/public/Plans";
import Services from "./pages/public/Services";
import Contact from "./pages/public/Contact";
import TermsAndConditions from "./pages/public/TermsAndConditions";

// Auth Pages
import RoleSelection from "./pages/auth/RoleSelection";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProviderRegister from "./pages/auth/ProviderRegister";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import GoogleAuthSuccess from "./pages/auth/GoogleAuthSuccess";

// User Pages
import Dashboard from "./pages/user/Dashboard";
import Profile from "./pages/user/Profile";
import MealPlans from "./pages/user/MealPlans";
import Subscriptions from "./pages/user/Subscriptions";
import OrderHistory from "./pages/user/OrderHistory";
import Notifications from "./pages/user/Notifications";
import AIDiet from "./pages/user/AIDiet";
import RecipeDetails from "./pages/user/RecipeDetails";
import WeeklyDietPlan from "./pages/user/WeeklyDietPlan";
import DietRestaurants from "./pages/user/DietRestaurants";
import RestaurantDetails from "./pages/user/RestaurantDetails";

// Restaurant Pages
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import RestaurantMenu from "./pages/restaurant/RestaurantMenu";
import RestaurantOrders from "./pages/restaurant/RestaurantOrders";
import RestaurantProfile from "./pages/restaurant/RestaurantProfile";
import RestaurantAnalytics from "./pages/restaurant/RestaurantAnalytics";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRestaurants from "./pages/admin/AdminRestaurants";

// Delivery Partner Pages
import DeliveryPartnerLogin from "./pages/delivery-partner/DeliveryPartnerLogin";
import DeliveryPartnerRegister from "./pages/delivery-partner/DeliveryPartnerRegister";
import DeliveryPartnerDashboard from "./pages/delivery-partner/DeliveryPartnerDashboard";
import AvailableRequests from "./pages/delivery-partner/AvailableRequests";
import MyDeliveries from "./pages/delivery-partner/MyDeliveries";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

            {/* Auth Routes */}
            <Route path="/select-role" element={<RoleSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/provider/register" element={<ProviderRegister />} />
            <Route path="/delivery-partner/login" element={<DeliveryPartnerLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-plans"
              element={
                <ProtectedRoute>
                  <MealPlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <Subscriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-diet"
              element={
                <ProtectedRoute>
                  <AIDiet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipe/:id"
              element={
                <ProtectedRoute>
                  <RecipeDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-plan/:id"
              element={
                <ProtectedRoute>
                  <WeeklyDietPlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-plan/:id/day/:day"
              element={
                <ProtectedRoute>
                  <WeeklyDietPlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diet-restaurants"
              element={
                <ProtectedRoute>
                  <DietRestaurants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diet-restaurants/:id"
              element={
                <ProtectedRoute>
                  <RestaurantDetails />
                </ProtectedRoute>
              }
            />

            {/* Restaurant Owner Routes */}
            <Route
              path="/restaurant/dashboard"
              element={
                <ProtectedRoute>
                  <RestaurantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant/menu"
              element={
                <ProtectedRoute>
                  <RestaurantMenu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant/orders"
              element={
                <ProtectedRoute>
                  <RestaurantOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant/profile"
              element={
                <ProtectedRoute>
                  <RestaurantProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant/analytics"
              element={
                <ProtectedRoute>
                  <RestaurantAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/restaurants"
              element={
                <ProtectedRoute>
                  <AdminRestaurants />
                </ProtectedRoute>
              }
            />

            {/* Delivery Partner Routes */}
            <Route path="/delivery-partner/register" element={<DeliveryPartnerRegister />} />
            <Route
              path="/delivery-partner/dashboard"
              element={
                <ProtectedRoute>
                  <DeliveryPartnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-partner/requests"
              element={
                <ProtectedRoute>
                  <AvailableRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-partner/deliveries"
              element={
                <ProtectedRoute>
                  <MyDeliveries />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
