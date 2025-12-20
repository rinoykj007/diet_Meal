const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const DietFood = require('./models/DietFood');

// Load env vars
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleRestaurants = [
  {
    name: 'Keto Kitchen',
    description: 'Specialized in ketogenic diet meals with high-fat, low-carb options',
    dietTypes: ['keto', 'low-carb', 'high-protein'],
    address: {
      street: '123 Health Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    phone: '+1-555-0101',
    email: 'contact@ketokitchen.com',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    isApproved: true,
    rating: 4.5,
    totalReviews: 127
  },
  {
    name: 'Green Leaf Vegan',
    description: '100% plant-based meals made with organic ingredients',
    dietTypes: ['vegan', 'vegetarian', 'gluten-free'],
    address: {
      street: '456 Garden Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    phone: '+1-555-0102',
    email: 'hello@greenleaf.com',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    isApproved: true,
    rating: 4.8,
    totalReviews: 243
  },
  {
    name: 'Diabetic Delights',
    description: 'Low-sugar, balanced meals perfect for diabetic patients',
    dietTypes: ['diabetic', 'low-carb', 'mediterranean'],
    address: {
      street: '789 Wellness Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    phone: '+1-555-0103',
    email: 'info@diabeticdelights.com',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
    isApproved: true,
    rating: 4.6,
    totalReviews: 189
  },
  {
    name: 'Paleo Paradise',
    description: 'Stone-age inspired meals with lean meats and vegetables',
    dietTypes: ['paleo', 'gluten-free', 'high-protein'],
    address: {
      street: '321 Primal Lane',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA'
    },
    phone: '+1-555-0104',
    email: 'orders@paleoparadise.com',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    isApproved: true,
    rating: 4.7,
    totalReviews: 156
  },
  {
    name: 'Mediterranean Magic',
    description: 'Authentic Mediterranean diet with heart-healthy fats',
    dietTypes: ['mediterranean', 'vegetarian', 'gluten-free'],
    address: {
      street: '654 Olive Street',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    phone: '+1-555-0105',
    email: 'contact@medmagic.com',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
    isApproved: true,
    rating: 4.9,
    totalReviews: 312
  },
  {
    name: 'Protein Power House',
    description: 'High-protein meals for athletes and fitness enthusiasts',
    dietTypes: ['high-protein', 'low-carb', 'keto'],
    address: {
      street: '987 Muscle Avenue',
      city: 'Denver',
      state: 'CO',
      zipCode: '80201',
      country: 'USA'
    },
    phone: '+1-555-0106',
    email: 'info@proteinpower.com',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
    isApproved: true,
    rating: 4.4,
    totalReviews: 98
  },
  {
    name: "John's Healthy Kitchen",
    description: 'Fresh, wholesome meals crafted with locally sourced ingredients',
    dietTypes: ['low-carb', 'gluten-free', 'high-protein'],
    address: {
      street: '234 Wellness Boulevard',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    },
    phone: '+1-555-0107',
    email: 'info@johnshealthykitchen.com',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    isApproved: true,
    rating: 4.6,
    totalReviews: 85
  },
  {
    name: "Maria's Vegan Bistro",
    description: 'Delicious plant-based cuisine with a Latin fusion twist',
    dietTypes: ['vegan', 'vegetarian', 'gluten-free'],
    address: {
      street: '567 Green Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    phone: '+1-555-0108',
    email: 'hello@mariasveganbistro.com',
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800',
    isApproved: true,
    rating: 4.7,
    totalReviews: 142
  },
  {
    name: "Chen's Asian Wellness",
    description: 'Traditional Asian cuisine optimized for modern health',
    dietTypes: ['low-carb', 'high-protein', 'gluten-free'],
    address: {
      street: '890 Dragon Way',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA'
    },
    phone: '+1-555-0109',
    email: 'contact@chensasian.com',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
    isApproved: true,
    rating: 4.8,
    totalReviews: 176
  },
  {
    name: "Sarah's Protein Bar",
    description: 'Fitness-focused meals for athletes and active lifestyles',
    dietTypes: ['high-protein', 'keto', 'low-carb'],
    address: {
      street: '432 Fitness Lane',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'USA'
    },
    phone: '+1-555-0110',
    email: 'orders@sarahsproteinbar.com',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    isApproved: true,
    rating: 4.5,
    totalReviews: 93
  },
  {
    name: "Hassan's Mediterranean Cafe",
    description: 'Authentic Middle Eastern flavors with a healthy twist',
    dietTypes: ['mediterranean', 'vegetarian', 'gluten-free'],
    address: {
      street: '765 Spice Road',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19101',
      country: 'USA'
    },
    phone: '+1-555-0111',
    email: 'info@hassansmediterranean.com',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800',
    isApproved: true,
    rating: 4.9,
    totalReviews: 208
  }
];

const sampleDietFoods = [
  // Keto Kitchen foods
  {
    name: 'Keto Bacon & Eggs Bowl',
    description: 'Crispy bacon, scrambled eggs, avocado, and cheese',
    dietType: 'keto',
    calories: 520,
    protein: 32,
    carbs: 8,
    fat: 42,
    fiber: 4,
    sugar: 2,
    sodium: 890,
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    servingSize: '350g',
    ingredients: ['Eggs', 'Bacon', 'Avocado', 'Cheddar Cheese', 'Spinach'],
    allergens: ['Eggs', 'Dairy'],
    preparationTime: 15,
    isAvailable: true
  },
  {
    name: 'Cauliflower Pizza',
    description: 'Low-carb pizza with cauliflower crust and mozzarella',
    dietType: 'keto',
    calories: 380,
    protein: 24,
    carbs: 12,
    fat: 28,
    fiber: 6,
    sugar: 4,
    sodium: 720,
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    servingSize: '300g',
    ingredients: ['Cauliflower', 'Mozzarella', 'Tomato Sauce', 'Pepperoni'],
    allergens: ['Dairy'],
    preparationTime: 25,
    isAvailable: true
  },
  {
    name: 'Butter Coffee (Bulletproof)',
    description: 'Coffee blended with grass-fed butter and MCT oil',
    dietType: 'keto',
    calories: 230,
    protein: 1,
    carbs: 0,
    fat: 25,
    fiber: 0,
    sugar: 0,
    sodium: 45,
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    servingSize: '350ml',
    ingredients: ['Coffee', 'Grass-fed Butter', 'MCT Oil'],
    allergens: ['Dairy'],
    preparationTime: 5,
    isAvailable: true
  },

  // Green Leaf Vegan foods
  {
    name: 'Buddha Bowl',
    description: 'Quinoa, chickpeas, kale, sweet potato, tahini dressing',
    dietType: 'vegan',
    calories: 450,
    protein: 18,
    carbs: 62,
    fat: 14,
    fiber: 12,
    sugar: 8,
    sodium: 320,
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    servingSize: '400g',
    ingredients: ['Quinoa', 'Chickpeas', 'Kale', 'Sweet Potato', 'Tahini'],
    allergens: ['Sesame'],
    preparationTime: 20,
    isAvailable: true
  },
  {
    name: 'Lentil Curry',
    description: 'Red lentils in coconut curry sauce with brown rice',
    dietType: 'vegan',
    calories: 420,
    protein: 16,
    carbs: 68,
    fat: 10,
    fiber: 14,
    sugar: 6,
    sodium: 450,
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400',
    servingSize: '380g',
    ingredients: ['Red Lentils', 'Coconut Milk', 'Brown Rice', 'Curry Spices'],
    allergens: [],
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: 'Acai Berry Smoothie Bowl',
    description: 'Acai, banana, berries, granola, coconut flakes',
    dietType: 'vegan',
    calories: 320,
    protein: 8,
    carbs: 54,
    fat: 9,
    fiber: 10,
    sugar: 28,
    sodium: 45,
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
    servingSize: '350g',
    ingredients: ['Acai', 'Banana', 'Mixed Berries', 'Granola', 'Coconut'],
    allergens: ['Tree Nuts'],
    preparationTime: 10,
    isAvailable: true
  },

  // Diabetic Delights foods
  {
    name: 'Grilled Salmon with Asparagus',
    description: 'Wild-caught salmon with steamed asparagus and quinoa',
    dietType: 'diabetic',
    calories: 380,
    protein: 36,
    carbs: 28,
    fat: 14,
    fiber: 6,
    sugar: 3,
    sodium: 420,
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    servingSize: '350g',
    ingredients: ['Salmon', 'Asparagus', 'Quinoa', 'Lemon', 'Olive Oil'],
    allergens: ['Fish'],
    preparationTime: 20,
    isAvailable: true
  },
  {
    name: 'Chicken Vegetable Stir-Fry',
    description: 'Lean chicken breast with mixed vegetables, low-sodium sauce',
    dietType: 'diabetic',
    calories: 340,
    protein: 32,
    carbs: 26,
    fat: 10,
    fiber: 5,
    sugar: 6,
    sodium: 380,
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    servingSize: '380g',
    ingredients: ['Chicken Breast', 'Broccoli', 'Bell Peppers', 'Brown Rice'],
    allergens: ['Soy'],
    preparationTime: 18,
    isAvailable: true
  },
  {
    name: 'Greek Yogurt Parfait',
    description: 'Sugar-free Greek yogurt with berries and almonds',
    dietType: 'diabetic',
    calories: 210,
    protein: 18,
    carbs: 22,
    fat: 6,
    fiber: 4,
    sugar: 12,
    sodium: 85,
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    servingSize: '250g',
    ingredients: ['Greek Yogurt', 'Strawberries', 'Blueberries', 'Almonds'],
    allergens: ['Dairy', 'Tree Nuts'],
    preparationTime: 5,
    isAvailable: true
  },

  // Paleo Paradise foods
  {
    name: 'Grass-Fed Beef Steak',
    description: 'Grilled ribeye with roasted vegetables',
    dietType: 'paleo',
    calories: 520,
    protein: 48,
    carbs: 14,
    fat: 32,
    fiber: 4,
    sugar: 6,
    sodium: 280,
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400',
    servingSize: '400g',
    ingredients: ['Grass-Fed Beef', 'Sweet Potato', 'Carrots', 'Zucchini'],
    allergens: [],
    preparationTime: 25,
    isAvailable: true
  },
  {
    name: 'Almond-Crusted Chicken',
    description: 'Chicken breast with almond crust and roasted Brussels sprouts',
    dietType: 'paleo',
    calories: 420,
    protein: 42,
    carbs: 18,
    fat: 22,
    fiber: 6,
    sugar: 4,
    sodium: 340,
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    servingSize: '350g',
    ingredients: ['Chicken Breast', 'Almonds', 'Brussels Sprouts', 'Garlic'],
    allergens: ['Tree Nuts'],
    preparationTime: 22,
    isAvailable: true
  },

  // Mediterranean Magic foods
  {
    name: 'Mediterranean Falafel Wrap',
    description: 'Chickpea falafel with hummus, cucumber, tomato in whole wheat wrap',
    dietType: 'mediterranean',
    calories: 480,
    protein: 16,
    carbs: 58,
    fat: 20,
    fiber: 10,
    sugar: 6,
    sodium: 520,
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
    servingSize: '320g',
    ingredients: ['Chickpeas', 'Whole Wheat Wrap', 'Hummus', 'Cucumber', 'Tomato'],
    allergens: ['Gluten', 'Sesame'],
    preparationTime: 15,
    isAvailable: true
  },
  {
    name: 'Greek Salad with Grilled Chicken',
    description: 'Fresh vegetables, feta cheese, olives, grilled chicken, olive oil dressing',
    dietType: 'mediterranean',
    calories: 420,
    protein: 34,
    carbs: 18,
    fat: 24,
    fiber: 6,
    sugar: 8,
    sodium: 680,
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    servingSize: '380g',
    ingredients: ['Chicken', 'Feta Cheese', 'Olives', 'Cucumber', 'Tomato', 'Red Onion'],
    allergens: ['Dairy'],
    preparationTime: 18,
    isAvailable: true
  },
  {
    name: 'Grilled Octopus',
    description: 'Tender grilled octopus with lemon, olive oil, and herbs',
    dietType: 'mediterranean',
    calories: 280,
    protein: 38,
    carbs: 8,
    fat: 10,
    fiber: 2,
    sugar: 1,
    sodium: 480,
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1625944527415-6e3d3ed046c6?w=400',
    servingSize: '280g',
    ingredients: ['Octopus', 'Lemon', 'Olive Oil', 'Oregano', 'Garlic'],
    allergens: ['Seafood'],
    preparationTime: 30,
    isAvailable: true
  },

  // Protein Power House foods
  {
    name: 'Bodybuilder Breakfast',
    description: 'Egg whites, turkey bacon, oatmeal, protein shake',
    dietType: 'high-protein',
    calories: 580,
    protein: 62,
    carbs: 48,
    fat: 12,
    fiber: 6,
    sugar: 8,
    sodium: 680,
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
    servingSize: '450g',
    ingredients: ['Egg Whites', 'Turkey Bacon', 'Oatmeal', 'Whey Protein'],
    allergens: ['Eggs', 'Dairy'],
    preparationTime: 15,
    isAvailable: true
  },
  {
    name: 'Grilled Chicken Power Bowl',
    description: 'Double chicken breast, brown rice, broccoli, boiled eggs',
    dietType: 'high-protein',
    calories: 620,
    protein: 68,
    carbs: 52,
    fat: 14,
    fiber: 8,
    sugar: 4,
    sodium: 520,
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400',
    servingSize: '480g',
    ingredients: ['Chicken Breast', 'Brown Rice', 'Broccoli', 'Eggs'],
    allergens: ['Eggs'],
    preparationTime: 20,
    isAvailable: true
  },
  {
    name: 'Tuna Protein Salad',
    description: 'Wild tuna, quinoa, edamame, mixed greens',
    dietType: 'high-protein',
    calories: 440,
    protein: 46,
    carbs: 34,
    fat: 12,
    fiber: 10,
    sugar: 4,
    sodium: 420,
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    servingSize: '400g',
    ingredients: ['Tuna', 'Quinoa', 'Edamame', 'Mixed Greens', 'Lemon Dressing'],
    allergens: ['Fish', 'Soy'],
    preparationTime: 12,
    isAvailable: true
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Restaurant.deleteMany({});
    await DietFood.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create sample users
    console.log('👤 Creating sample users...');

    // All restaurant providers use the same password for easy testing
    const hashedPassword = await bcrypt.hash('provider123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    // Create restaurant owner user
    let ownerUser = await User.findOne({ email: 'owner@example.com' });
    if (!ownerUser) {
      ownerUser = await User.create({
        email: 'owner@example.com',
        password: hashedPassword,  // Uses provider123
        fullName: 'Restaurant Owner',
        phone: '+1-555-9999',
        roles: ['user', 'provider']  // Added provider role
      });
      console.log('✅ Restaurant owner created (email: owner@example.com, password: provider123)');
    } else {
      console.log('✅ Restaurant owner already exists');
    }

    // Create admin user
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      adminUser = await User.create({
        email: 'admin@example.com',
        password: hashedAdminPassword,
        fullName: 'Admin User',
        phone: '+1-555-0000',
        roles: ['user', 'admin']
      });
      console.log('✅ Admin user created (email: admin@example.com, password: admin123)\n');
    } else {
      console.log('✅ Admin user already exists\n');
    }

    // Create additional provider users
    console.log('👨‍🍳 Creating additional restaurant provider users...');

    // All providers below use the same password: provider123

    // Provider 1: John Smith
    let provider1 = await User.findOne({ email: 'john.smith@provider.com' });
    if (!provider1) {
      provider1 = await User.create({
        email: 'john.smith@provider.com',
        password: hashedPassword,  // Uses provider123
        fullName: 'John Smith',
        phone: '+1-555-1001',
        roles: ['user', 'provider']  // Added provider role
      });
      console.log('✅ Provider 1 created (email: john.smith@provider.com, password: provider123)');
    }

    // Provider 2: Maria Garcia
    let provider2 = await User.findOne({ email: 'maria.garcia@provider.com' });
    if (!provider2) {
      provider2 = await User.create({
        email: 'maria.garcia@provider.com',
        password: hashedPassword,  // Uses provider123
        fullName: 'Maria Garcia',
        phone: '+1-555-1002',
        roles: ['user', 'provider']  // Added provider role
      });
      console.log('✅ Provider 2 created (email: maria.garcia@provider.com, password: provider123)');
    }

    // Provider 3: David Chen
    let provider3 = await User.findOne({ email: 'david.chen@provider.com' });
    if (!provider3) {
      provider3 = await User.create({
        email: 'david.chen@provider.com',
        password: hashedPassword,  // Uses provider123
        fullName: 'David Chen',
        phone: '+1-555-1003',
        roles: ['user', 'provider']  // Added provider role
      });
      console.log('✅ Provider 3 created (email: david.chen@provider.com, password: provider123)');
    }

    // Provider 4: Sarah Johnson
    let provider4 = await User.findOne({ email: 'sarah.johnson@provider.com' });
    if (!provider4) {
      provider4 = await User.create({
        email: 'sarah.johnson@provider.com',
        password: hashedPassword,  // Uses provider123
        fullName: 'Sarah Johnson',
        phone: '+1-555-1004',
        roles: ['user', 'provider']  // Added provider role
      });
      console.log('✅ Provider 4 created (email: sarah.johnson@provider.com, password: provider123)');
    }

    // Provider 5: Ahmed Hassan
    let provider5 = await User.findOne({ email: 'ahmed.hassan@provider.com' });
    if (!provider5) {
      provider5 = await User.create({
        email: 'ahmed.hassan@provider.com',
        password: hashedPassword,  // Uses provider123
        fullName: 'Ahmed Hassan',
        phone: '+1-555-1005',
        roles: ['user', 'provider']  // Added provider role
      });
      console.log('✅ Provider 5 created (email: ahmed.hassan@provider.com, password: provider123)');
    }

    console.log('✅ All provider users created\n');

    // Create delivery partner users
    console.log('🚚 Creating delivery partner users...');

    // Delivery Partner 1: Mike Johnson
    let deliveryPartner1 = await User.findOne({ email: 'mike.delivery@example.com' });
    if (!deliveryPartner1) {
      deliveryPartner1 = await User.create({
        email: 'mike.delivery@example.com',
        password: hashedPassword,  // Uses provider123
        fullName: 'Mike Johnson',
        phone: '+1-555-2001',
        roles: ['user', 'delivery-partner']
      });
      console.log('✅ Delivery Partner 1 created (email: mike.delivery@example.com, password: provider123)');
    }

    // Delivery Partner 2: Sarah Williams
    let deliveryPartner2 = await User.findOne({ email: 'sarah.delivery@example.com' });
    if (!deliveryPartner2) {
      deliveryPartner2 = await User.create({
        email: 'sarah.delivery@example.com',
        password: hashedPassword,  // Uses provider123
        fullName: 'Sarah Williams',
        phone: '+1-555-2002',
        roles: ['user', 'delivery-partner']
      });
      console.log('✅ Delivery Partner 2 created (email: sarah.delivery@example.com, password: provider123)');
    }

    // Delivery Partner 3: Alex Rodriguez
    let deliveryPartner3 = await User.findOne({ email: 'alex.delivery@example.com' });
    if (!deliveryPartner3) {
      deliveryPartner3 = await User.create({
        email: 'alex.delivery@example.com',
        password: hashedPassword,  // Uses provider123
        fullName: 'Alex Rodriguez',
        phone: '+1-555-2003',
        roles: ['user', 'delivery-partner']
      });
      console.log('✅ Delivery Partner 3 created (email: alex.delivery@example.com, password: provider123)');
    }

    console.log('✅ All delivery partners created\n');


    // Create restaurants
    console.log('🏪 Creating restaurants...');
    const createdRestaurants = [];

    // Map restaurants to their owners
    const restaurantOwnerMap = {
      'Keto Kitchen': ownerUser,
      'Green Leaf Vegan': ownerUser,
      'Diabetic Delights': ownerUser,
      'Paleo Paradise': ownerUser,
      'Mediterranean Magic': ownerUser,
      'Protein Power House': ownerUser,
      "John's Healthy Kitchen": provider1,
      "Maria's Vegan Bistro": provider2,
      "Chen's Asian Wellness": provider3,
      "Sarah's Protein Bar": provider4,
      "Hassan's Mediterranean Cafe": provider5
    };

    for (const restaurantData of sampleRestaurants) {
      const owner = restaurantOwnerMap[restaurantData.name];
      const restaurant = await Restaurant.create({
        ...restaurantData,
        ownerId: owner._id
      });
      createdRestaurants.push(restaurant);
      console.log(`   ✓ Created: ${restaurant.name} (Owner: ${owner.fullName})`);
    }
    console.log(`✅ ${createdRestaurants.length} restaurants created\n`);

    // Create diet foods
    console.log('🍽️  Creating diet food items...');
    let foodCount = 0;

    // Distribute foods across restaurants
    const restaurantFoodMap = {
      'Keto Kitchen': ['Keto Bacon & Eggs Bowl', 'Cauliflower Pizza', 'Butter Coffee (Bulletproof)'],
      'Green Leaf Vegan': ['Buddha Bowl', 'Lentil Curry', 'Acai Berry Smoothie Bowl'],
      'Diabetic Delights': ['Grilled Salmon with Asparagus', 'Chicken Vegetable Stir-Fry', 'Greek Yogurt Parfait'],
      'Paleo Paradise': ['Grass-Fed Beef Steak', 'Almond-Crusted Chicken'],
      'Mediterranean Magic': ['Mediterranean Falafel Wrap', 'Greek Salad with Grilled Chicken', 'Grilled Octopus'],
      'Protein Power House': ['Bodybuilder Breakfast', 'Grilled Chicken Power Bowl', 'Tuna Protein Salad']
    };

    for (const restaurant of createdRestaurants) {
      const foodNames = restaurantFoodMap[restaurant.name] || [];
      const restaurantFoods = sampleDietFoods.filter(food => foodNames.includes(food.name));

      for (const foodData of restaurantFoods) {
        await DietFood.create({
          ...foodData,
          restaurantId: restaurant._id
        });
        console.log(`   ✓ Created: ${foodData.name} at ${restaurant.name}`);
        foodCount++;
      }
    }
    console.log(`✅ ${foodCount} diet food items created\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Restaurants: ${createdRestaurants.length}`);
    console.log(`   - Diet Foods: ${foodCount}`);
    console.log(`   - Users: 7 (1 Admin + 6 Restaurant Providers)`);
    console.log('\n👥 User Credentials:');
    console.log('   🔑 Admin User: admin@example.com (password: admin123)');
    console.log('   🏪 All Restaurant Providers use password: provider123');
    console.log('   👨‍🍳 Provider Accounts & Their Restaurants:');
    console.log('      - owner@example.com (Owns: 6 restaurants)');
    console.log("      - john.smith@provider.com (Owns: John's Healthy Kitchen)");
    console.log("      - maria.garcia@provider.com (Owns: Maria's Vegan Bistro)");
    console.log("      - david.chen@provider.com (Owns: Chen's Asian Wellness)");
    console.log("      - sarah.johnson@provider.com (Owns: Sarah's Protein Bar)");
    console.log("      - ahmed.hassan@provider.com (Owns: Hassan's Mediterranean Cafe)");
    console.log('\n✨ You can now browse restaurants at: http://localhost:8080/diet-restaurants\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed
connectDB().then(() => {
  seedDatabase();
});
