import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Salad, CalendarDays, TrendingUp, Users, Clock, Shield, Leaf } from 'lucide-react';

const services = [
  {
    icon: Brain,
    title: 'AI-Powered Diet Planning',
    description: 'Our advanced AI analyzes your health goals, preferences, and dietary restrictions to create personalized meal plans.',
  },
  {
    icon: Salad,
    title: 'Fresh Meal Delivery',
    description: 'Get chef-prepared, nutritious meals delivered fresh to your doorstep from verified diet providers.',
  },
  {
    icon: CalendarDays,
    title: 'Flexible Subscriptions',
    description: 'Choose weekly or monthly plans. Pause, modify, or cancel anytime with full flexibility.',
  },
  {
    icon: TrendingUp,
    title: 'Nutrition Tracking',
    description: 'Track your calorie intake, macros, and nutritional progress with detailed analytics.',
  },
  {
    icon: Users,
    title: 'Expert Provider Network',
    description: 'Access meals from certified nutritionists, hotels, and specialized diet kitchens.',
  },
  {
    icon: Clock,
    title: 'Scheduled Deliveries',
    description: 'Set your preferred delivery times and locations. We work around your schedule.',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'All providers are verified and meals are prepared following strict hygiene standards.',
  },
  {
    icon: Leaf,
    title: 'Special Diet Support',
    description: 'Keto, vegan, paleo, diabetic-friendly, and more. We cater to all dietary needs.',
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Our Services
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how NutriPlan transforms your eating habits with AI-powered meal planning 
              and premium diet meal delivery services.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Create Profile', desc: 'Tell us about your health goals and dietary preferences' },
                { step: '02', title: 'AI Analysis', desc: 'Our AI creates a personalized meal plan just for you' },
                { step: '03', title: 'Choose Provider', desc: 'Select from verified diet meal providers in your area' },
                { step: '04', title: 'Enjoy Meals', desc: 'Fresh, healthy meals delivered to your doorstep' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
