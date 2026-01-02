const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const DietFood = require('../models/DietFood');

dotenv.config();

const resetDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...\n');

        console.log('🗑️  Deleting ALL data from database...');

        await User.deleteMany({});
        console.log('✅ All users deleted');

        await Restaurant.deleteMany({});
        console.log('✅ All restaurants deleted');

        await DietFood.deleteMany({});
        console.log('✅ All diet foods deleted');

        console.log('\n✨ Database completely cleared!');
        console.log('👉 Now run: node seedData.js\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetDatabase();
