import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2563eb',
  },
  summary: {
    fontSize: 11,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f9ff',
  },
  daySection: {
    marginBottom: 15,
    paddingBottom: 10,
  },
  dayTitle: {
    fontSize: 14,
    marginBottom: 8,
    color: '#1e40af',
  },
  mealCard: {
    marginBottom: 8,
    marginLeft: 10,
  },
  mealType: {
    fontSize: 11,
    color: '#059669',
    marginBottom: 3,
  },
  mealName: {
    fontSize: 10,
    marginBottom: 2,
  },
  macros: {
    fontSize: 9,
    color: '#4b5563',
    marginBottom: 3,
  },
  ingredients: {
    fontSize: 8,
    color: '#6b7280',
  },
  shoppingSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
  },
  shoppingTitle: {
    fontSize: 14,
    marginBottom: 8,
    color: '#1e40af',
  },
  shoppingList: {
    fontSize: 9,
  },
});

interface Meal {
  mealType: string;
  name: string;
  description: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  ingredients: string[];
  instructions: string;
}

interface DayPlan {
  day: string;
  meals: Meal[];
}

interface Recommendation {
  summary: string;
  weeklyPlan: DayPlan[];
  shoppingList: string[];
}

interface MealPlanPDFProps {
  recommendation: Recommendation;
}

export const MealPlanPDF = ({ recommendation }: MealPlanPDFProps) => {
  const allItems = recommendation.shoppingList.join(', ').split(',');
  const uniqueItems = [...new Set(allItems.map(item => item.trim()).filter(item => item))];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>7-Day Personalized Meal Plan</Text>

        <View style={styles.summary}>
          <Text>{recommendation.summary}</Text>
        </View>

        {recommendation.weeklyPlan.map((day, dayIndex) => (
          <View key={dayIndex} style={styles.daySection}>
            <Text style={styles.dayTitle}>{day.day}</Text>

            {day.meals.map((meal, mealIndex) => (
              <View key={mealIndex} style={styles.mealCard}>
                <Text style={styles.mealType}>{meal.mealType}</Text>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.macros}>
                  {meal.calories} cal | Protein: {meal.macros.protein}g | Carbs: {meal.macros.carbs}g | Fats: {meal.macros.fats}g
                </Text>
                <Text style={styles.ingredients}>
                  Ingredients: {meal.ingredients.slice(0, 5).join(', ')}
                  {meal.ingredients.length > 5 && '...'}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.shoppingSection}>
          <Text style={styles.shoppingTitle}>Shopping List</Text>
          <Text style={styles.shoppingList}>
            {uniqueItems.join(', ')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
