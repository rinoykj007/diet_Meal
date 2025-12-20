import recipeBreakfast from "@/assets/recipe-breakfast.jpg";

const RecipeCard = () => {
  const timeSlots = ["07:00", "10:00", "13:00", "18:00"];

  return (
    <div className="bg-card rounded-3xl p-6 shadow-soft space-y-4">
      <h3 className="text-xl font-bold text-navy">Required Recipe</h3>
      
      {/* Time Slots */}
      <div className="flex gap-2">
        {timeSlots.map((time, index) => (
          <span
            key={time}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              index === 0
                ? "bg-navy text-navy-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {time}
          </span>
        ))}
      </div>

      {/* Recipe Content */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Recipe by the hour</p>
        <div className="rounded-2xl overflow-hidden">
          <img
            src={recipeBreakfast}
            alt="Breakfast recipe with eggs and herbs"
            className="w-full h-40 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
