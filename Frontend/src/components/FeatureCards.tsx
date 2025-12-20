import ingredientsSpread from "@/assets/ingredients-spread.jpg";
import mealTiming from "@/assets/meal-timing.jpg";

const FeatureCards = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipe Search Card */}
        <div className="bg-card rounded-3xl p-8 shadow-soft">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
            Recipe Search by Ingredient
          </h2>
          <div className="rounded-2xl overflow-hidden">
            <img
              src={ingredientsSpread}
              alt="Fresh ingredients spread including vegetables, cheese, and herbs"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>

        {/* Automatic Meal Plan Card */}
        <div className="bg-card rounded-3xl p-8 shadow-soft">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
            Automatic Meal Plan
          </h2>
          <div className="rounded-2xl overflow-hidden">
            <img
              src={mealTiming}
              alt="Vegetables with alarm clocks representing meal timing"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
