const NutrientCard = () => {
  const nutrients = [
    { name: "Calories", current: 1100, max: 2000 },
    { name: "Carbohydrates", current: 300, max: 325 },
    { name: "Proteins", current: 10, max: 75 },
  ];

  return (
    <div className="bg-card rounded-3xl p-6 shadow-soft space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-navy">Nutrients required</h3>
        <p className="text-sm text-muted-foreground">nutrients needed in a day</p>
      </div>

      {/* Nutrient Bars */}
      <div className="space-y-4">
        {nutrients.map((nutrient) => {
          const progress = (nutrient.current / nutrient.max) * 100;
          return (
            <div key={nutrient.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  {nutrient.name}
                </span>
                <span className="text-sm font-semibold text-navy">
                  {nutrient.current}/{nutrient.max}
                </span>
              </div>
              <div 
                className="nutrient-bar"
                style={{ "--progress": `${progress}%` } as React.CSSProperties}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NutrientCard;
