import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Users, Truck, UtensilsCrossed } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <ScrollText className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Terms & Conditions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Please read these terms and conditions carefully before using our
              service
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last Updated: January 7, 2026
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger
                  value="delivery"
                  className="flex items-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span className="hidden sm:inline">Delivery Partners</span>
                </TabsTrigger>
                <TabsTrigger
                  value="restaurant"
                  className="flex items-center gap-2"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span className="hidden sm:inline">Restaurants</span>
                </TabsTrigger>
              </TabsList>

              {/* Users Terms */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Conditions for Users</CardTitle>
                    <CardDescription>
                      By using our meal planning and ordering service, you agree
                      to these terms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        1. Service Description
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Mealplan provides AI-powered personalized diet plans,
                        meal ordering, and delivery services. Our service
                        includes access to nutritional information, customized
                        meal plans based on your health goals, and the ability
                        to order from partnered restaurants.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        2. User Account
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        When creating an account, you agree to:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Provide accurate and complete information</li>
                        <li>
                          Maintain the security of your account credentials
                        </li>
                        <li>
                          Accept responsibility for all activities under your
                          account
                        </li>
                        <li>
                          Notify us immediately of any unauthorized access
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        3. Orders and Payments
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        Regarding orders and payments:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>
                          All prices are in USD and subject to applicable taxes
                        </li>
                        <li>
                          Payment must be completed before order processing
                        </li>
                        <li>
                          You are responsible for providing accurate delivery
                          information
                        </li>
                        <li>
                          Orders cannot be canceled once confirmed by the
                          restaurant
                        </li>
                        <li>
                          Refunds are processed according to our refund policy
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        4. Dietary Information
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        While we strive to provide accurate nutritional
                        information and personalized recommendations, our
                        service is not a substitute for professional medical
                        advice. Always consult with healthcare professionals
                        regarding dietary restrictions, allergies, and health
                        conditions.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        5. User Conduct
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        You agree not to:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Use the service for any illegal purposes</li>
                        <li>
                          Attempt to gain unauthorized access to our systems
                        </li>
                        <li>
                          Interfere with the proper functioning of the service
                        </li>
                        <li>Submit false or misleading information</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        6. Limitation of Liability
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Mealplan is not liable for any indirect, incidental, or
                        consequential damages arising from the use of our
                        service. Our total liability shall not exceed the amount
                        paid by you in the past 12 months.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        By creating profile, you agree to the terms of the
                        application by default
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Delivery Partners Terms */}
              <TabsContent value="delivery" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Terms & Conditions for Delivery Partners
                    </CardTitle>
                    <CardDescription>
                      By registering as a delivery partner, you agree to these
                      terms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        1. Partnership Agreement
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        As a delivery partner, you are an independent
                        contractor, not an employee of Mealplan. This agreement
                        does not create an employment relationship, partnership,
                        or joint venture.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        2. Eligibility Requirements
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        To become a delivery partner, you must:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Be at least 18 years old</li>
                        <li>
                          Have a valid driver's license or mode of
                          transportation
                        </li>
                        <li>Provide valid insurance documentation</li>
                        <li>Pass a background check (where applicable)</li>
                        <li>
                          Have a smartphone capable of running our partner app
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        3. Delivery Obligations
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        You agree to:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Deliver orders promptly and safely</li>
                        <li>
                          Maintain food quality and temperature during transport
                        </li>
                        <li>
                          Communicate professionally with customers and
                          restaurants
                        </li>
                        <li>Follow all traffic laws and safety regulations</li>
                        <li>Report any issues or incidents immediately</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        4. Compensation
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Delivery fees are calculated based on distance, time,
                        and demand. Payments are processed weekly to your
                        registered bank account. You are responsible for all
                        applicable taxes on your earnings.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        5. Equipment and Expenses
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        You are responsible for maintaining your vehicle, fuel
                        costs, insurance, and any equipment needed for
                        deliveries. Mealplan does not reimburse for these
                        expenses unless explicitly stated.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        6. Termination
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Either party may terminate this agreement at any time.
                        Mealplan reserves the right to deactivate accounts for
                        violations of these terms, poor performance, or
                        fraudulent activity.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        7. Insurance and Liability
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        You must maintain adequate insurance coverage for your
                        vehicle and activities. You are liable for any damages
                        or injuries caused during deliveries.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        By creating profile, you agree to the terms of the
                        application by default
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Restaurant Terms */}
              <TabsContent value="restaurant" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Terms & Conditions for Restaurant Partners
                    </CardTitle>
                    <CardDescription>
                      By partnering with Mealplan, you agree to these terms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        1. Partnership Overview
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Mealplan provides a platform for restaurants to reach
                        health-conscious customers seeking nutritious meal
                        options. This partnership enables you to expand your
                        customer base and streamline online ordering.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        2. Restaurant Responsibilities
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        As a partner restaurant, you agree to:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>
                          Maintain all required health and safety certifications
                        </li>
                        <li>Provide accurate menu information and pricing</li>
                        <li>
                          Include detailed nutritional information for all menu
                          items
                        </li>
                        <li>Ensure food quality and safety standards</li>
                        <li>Prepare orders within agreed timeframes</li>
                        <li>Maintain adequate inventory for listed items</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        3. Menu Management
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        You are responsible for keeping your menu up-to-date,
                        including prices, availability, and nutritional
                        information. Any changes must be reflected in the system
                        within 24 hours. Accurate nutritional data is mandatory
                        for all items.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        4. Order Processing
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        Order handling requirements:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>
                          Accept or reject orders within 5 minutes of receipt
                        </li>
                        <li>
                          Prepare orders within the estimated time provided
                        </li>
                        <li>
                          Notify customers of any delays or issues immediately
                        </li>
                        <li>
                          Package food securely to maintain quality during
                          delivery
                        </li>
                        <li>
                          Accommodate special dietary requests when possible
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        5. Commission and Payments
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Mealplan charges a commission on each order processed
                        through the platform. Payments are transferred to your
                        account weekly, minus applicable commissions and fees.
                        Detailed transaction reports are available in your
                        dashboard.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        6. Quality Standards
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Restaurants must maintain a minimum rating and service
                        quality. Consistently poor performance, customer
                        complaints, or health violations may result in
                        suspension or termination of the partnership.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        7. Intellectual Property
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        You grant Mealplan the right to use your restaurant
                        name, logo, and menu items for promotional purposes on
                        our platform. You retain all ownership rights to your
                        brand and intellectual property.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        8. Refunds and Cancellations
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        You are responsible for costs associated with order
                        errors, quality issues, or items prepared incorrectly.
                        Customer refunds for restaurant errors will be deducted
                        from your payments.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        By creating profile, you agree to the terms of the
                        application by default
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* General Terms for All */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>General Terms Applicable to All Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Privacy and Data Protection
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your privacy is important to us. Please review our Privacy
                    Policy to understand how we collect, use, and protect your
                    personal information. By using our service, you consent to
                    our data practices as described in the Privacy Policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Modifications to Terms
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Mealplan reserves the right to modify these terms at any
                    time. We will notify users of significant changes via email
                    or platform notifications. Continued use of the service
                    after changes constitutes acceptance of the updated terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Dispute Resolution
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Any disputes arising from these terms will be resolved
                    through binding arbitration in accordance with applicable
                    laws. Both parties agree to waive the right to a jury trial.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    By creating profile, you agree to the terms of the
                    application by default
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Contact Information
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about these terms, please contact us
                    at legal@mealplan.com or through our contact page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
