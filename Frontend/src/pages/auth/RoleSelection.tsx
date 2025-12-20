import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Store, Truck, Shield, ChevronRight, Sparkles } from 'lucide-react';

interface RoleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    onClick: () => void;
}

function RoleCard({ title, description, icon, gradient, onClick }: RoleCardProps) {
    return (
        <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary group"
            onClick={onClick}
        >
            <CardHeader>
                <div className={`w-16 h-16 rounded-full ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <CardTitle className="text-xl flex items-center justify-between">
                    {title}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-primary font-medium">
                    Click to login →
                </div>
            </CardContent>
        </Card>
    );
}

export default function RoleSelection() {
    const navigate = useNavigate();

    const roles = [
        {
            title: 'User',
            description: 'Access personalized meal plans, order food, and track your nutrition journey',
            icon: <User className="w-8 h-8 text-white" />,
            gradient: 'bg-gradient-to-br from-green-500 to-green-600',
            path: '/login?role=user'
        },
        {
            title: 'Restaurant / Provider',
            description: 'Manage your restaurant, menu, orders, and serve healthy meals',
            icon: <Store className="w-8 h-8 text-white" />,
            gradient: 'bg-gradient-to-br from-orange-500 to-red-500',
            path: '/login?role=provider'
        },
        {
            title: 'Delivery Partner',
            description: 'Accept delivery requests, earn money, and deliver shopping lists',
            icon: <Truck className="w-8 h-8 text-white" />,
            gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
            path: '/delivery-partner/login'
        },
        {
            title: 'Admin',
            description: 'System administration, user management, and platform oversight',
            icon: <Shield className="w-8 h-8 text-white" />,
            gradient: 'bg-gradient-to-br from-red-600 to-pink-600',
            path: '/login?role=admin'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Welcome to NutriPlan
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Select your role to continue to the login page
                    </p>
                </div>

                {/* Role Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.title}
                            title={role.title}
                            description={role.description}
                            icon={role.icon}
                            gradient={role.gradient}
                            onClick={() => navigate(role.path)}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center mt-12">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <a href="/register" className="text-primary hover:underline font-medium">
                            Sign up as User
                        </a>
                        {' or '}
                        <a href="/delivery-partner/register" className="text-primary hover:underline font-medium">
                            Become a Delivery Partner
                        </a>
                    </p>
                </div>

                {/* Info Banner */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-sm text-blue-900">
                            <p className="font-semibold mb-1">Quick Access Guide:</p>
                            <ul className="space-y-1">
                                <li><strong>Users:</strong> Browse meal plans, order healthy food, track nutrition</li>
                                <li><strong>Restaurants:</strong> Manage menu, accept orders, grow your business</li>
                                <li><strong>Delivery Partners:</strong> Deliver shopping lists, earn $10 per delivery</li>
                                <li><strong>Admins:</strong> Manage platform users and restaurants</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
