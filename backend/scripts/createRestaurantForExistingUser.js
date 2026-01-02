const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Provider = require('../models/Provider');

async function createRestaurantAndProviderForExistingUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all users with restaurant role but no Restaurant document
    const restaurantUsers = await User.find({ roles: 'restaurant' });
    console.log(`\nFound ${restaurantUsers.length} users with restaurant role`);

    let restaurantsCreated = 0;
    for (const user of restaurantUsers) {
      const existingRestaurant = await Restaurant.findOne({ ownerId: user._id });

      if (!existingRestaurant) {
        await Restaurant.create({
          name: `${user.fullName}'s Restaurant`,
          description: 'Please update your restaurant details',
          dietTypes: [],
          ownerId: user._id,
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          location: {
            type: 'Point',
            coordinates: [0, 0]
          },
          phone: '',
          email: user.email,
          isApproved: false,
          isActive: true
        });
        console.log(`✅ Created Restaurant for ${user.email} (${user.fullName})`);
        restaurantsCreated++;
      } else {
        console.log(`ℹ️  Restaurant already exists for ${user.email}`);
      }
    }

    // Find all users with delivery-partner role but no Provider document
    const deliveryUsers = await User.find({ roles: 'delivery-partner' });
    console.log(`\nFound ${deliveryUsers.length} users with delivery-partner role`);

    let providersCreated = 0;
    for (const user of deliveryUsers) {
      const existingProvider = await Provider.findOne({ userId: user._id });

      if (!existingProvider) {
        await Provider.create({
          userId: user._id,
          businessName: `${user.fullName}'s Delivery Service`,
          description: 'Please update your delivery service details',
          address: '',
          phone: '',
          isActive: true
        });
        console.log(`✅ Created Provider for ${user.email} (${user.fullName})`);
        providersCreated++;
      } else {
        console.log(`ℹ️  Provider already exists for ${user.email}`);
      }
    }

    console.log(`\n✨ Done!`);
    console.log(`   Created ${restaurantsCreated} Restaurant documents`);
    console.log(`   Created ${providersCreated} Provider documents`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createRestaurantAndProviderForExistingUsers();
