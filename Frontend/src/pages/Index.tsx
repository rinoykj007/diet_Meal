import Header from "@/components/Header";
import RecipeCard from "@/components/RecipeCard";
import NutrientCard from "@/components/NutrientCard";
import FeatureCards from "@/components/FeatureCards";
import IntegrationSection from "@/components/IntegrationSection";
import { Footer } from "@/components/Footer";
import heroSalad from "@/assets/hero-salad.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section with embedded cards */}
        <section className="w-full px-6 md:px-12 lg:px-20 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Hero Content */}
              <div className="lg:col-span-5 space-y-8">
                <HeroContent />
              </div>

              {/* Right Column - Hero Image + Cards */}
              <div className="lg:col-span-7 space-y-6">
                <HeroImage />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RecipeCard />
                  <NutrientCard />
                </div>
              </div>
            </div>
          </div>
        </section>

        <FeatureCards />
        <IntegrationSection />
      </main>

      <Footer />
    </div>
  );
};

// Extracted Hero Content
const HeroContent = () => {
  const nutrients = ["Calories", "Carbohydrates", "Proteins", "Fat"];

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-navy leading-[1.1]">
          Recipe and Meal Plan App with Ai
        </h1>
        <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
          Save time in planning meals according to available ingredients and
          help users to have a healthy or customized diet.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex items-center gap-3">
        <button className="bg-navy text-navy-foreground px-8 py-4 rounded-full font-semibold shadow-soft hover:shadow-card transition-all">
          Try for Free
        </button>
        <button className="bg-lime text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center shadow-soft hover:shadow-card transition-all">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </button>
      </div>

      {/* Nutrients Section */}
      <div className="pt-6 space-y-4">
        <p className="text-navy font-semibold text-lg max-w-sm leading-snug">
          Don't forget to replenish the nutrients you need in a day.
        </p>
        <div className="flex flex-wrap gap-2">
          {nutrients.map((nutrient) => (
            <span
              key={nutrient}
              className="px-4 py-2 bg-card rounded-full text-sm font-medium text-foreground border border-border"
            >
              {nutrient}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

// Extracted Hero Image
const HeroImage = () => {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-card">
      <img
        src={heroSalad}
        alt="Fresh healthy salad bowl with colorful vegetables"
        className="w-full h-auto object-cover aspect-[16/10]"
      />

      {/* Floating Badge - Nutrition Analysis */}
      <div className="absolute top-6 left-1/4 bg-card rounded-full px-4 py-2 shadow-badge flex items-center gap-2 text-sm font-medium animate-float">
        <div className="w-6 h-6 bg-lime rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <span>Nutrition Analysis</span>
      </div>

      {/* Floating Badge - Automatic Meal Plan */}
      <div
        className="absolute bottom-8 right-4 bg-card rounded-full px-4 py-2 shadow-badge flex items-center gap-2 text-sm font-medium animate-float"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="w-6 h-6 bg-lime rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <span>Automatic Meal Plan</span>
      </div>
    </div>
  );
};

export default Index;
