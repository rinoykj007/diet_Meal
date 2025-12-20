import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: 49,
    period: 'week',
    description: 'Perfect for getting started with healthy eating',
    features: [
      '7 meals per week',
      'AI meal recommendations',
      'Basic nutrition tracking',
      'Email support',
      'Flexible delivery schedule',
    ],
    popular: false,
  },
  {
    name: 'Standard',
    price: 89,
    period: 'week',
    description: 'Most popular choice for health-conscious individuals',
    features: [
      '14 meals per week',
      'Advanced AI diet planning',
      'Full nutrition analytics',
      'Priority support',
      'Custom meal preferences',
      'Calorie & macro tracking',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    price: 149,
    period: 'week',
    description: 'Complete nutrition solution for optimal health',
    features: [
      '21 meals per week',
      'Personal AI nutritionist',
      'Advanced health insights',
      '24/7 priority support',
      'Unlimited meal swaps',
      'Exclusive recipes',
      'Family meal options',
    ],
    popular: false,
  },
];

export default function Plans() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the perfect meal plan that fits your lifestyle and health goals. 
              All plans include fresh delivery and AI-powered recommendations.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-0">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/register">
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: 'Can I change my plan?', a: 'Yes, you can upgrade or downgrade your plan at any time.' },
                { q: 'How does delivery work?', a: 'Meals are delivered fresh daily or weekly based on your preference.' },
                { q: 'Are there any contracts?', a: 'No long-term contracts. Cancel or pause anytime.' },
                { q: 'Do you accommodate allergies?', a: 'Absolutely! Specify your allergies and we\'ll ensure safe meals.' },
              ].map((faq, index) => (
                <div key={index} className="bg-card p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
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
