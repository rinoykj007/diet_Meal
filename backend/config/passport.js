const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Provider = require('../models/Provider');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true, // Enable access to req object
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const isRegistration = req.session?.isRegistration || false;
          const intendedRole = req.session?.intendedRole || 'user';

          // Check if user already exists
          let user = await User.findOne({ email });

          // LOGIN FLOW: User must exist
          if (!isRegistration) {
            if (!user) {
              return done(null, false, {
                message: 'Account not found. Please register first.'
              });
            }

            // Optionally add intended role if user is signing in as restaurant/delivery-partner
            if (intendedRole && ['restaurant', 'delivery-partner', 'admin'].includes(intendedRole)) {
              if (!user.roles.includes(intendedRole)) {
                user.roles.push(intendedRole);
                await user.save();
              }
            }

            // Auto-create Restaurant document if user has restaurant role but no restaurant exists
            if (user.roles.includes('restaurant')) {
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
                  phone: '',
                  email: user.email,
                  isApproved: false,
                  isActive: true
                });
              }
            }

            // Auto-create Provider document if user has delivery-partner role but no provider exists
            if (user.roles.includes('delivery-partner')) {
              const existingProvider = await Provider.findOne({ userId: user._id });
              if (!existingProvider) {
                await Provider.create({
                  userId: user._id,
                  businessName: `${user.fullName}'s Delivery Service`,
                  description: 'Please update your delivery partner details',
                  address: '',
                  phone: '',
                  isActive: true
                });
              }
            }

            return done(null, user);
          }

          // REGISTRATION FLOW: User must NOT exist
          if (isRegistration) {
            if (user) {
              return done(null, false, {
                message: 'Account already exists. Please login instead.'
              });
            }

            // Create new user with intended role
            const roles = intendedRole && ['restaurant', 'delivery-partner', 'admin'].includes(intendedRole)
              ? [intendedRole]
              : ['user'];

            user = await User.create({
              email,
              fullName: profile.displayName,
              password: 'google-oauth-' + Date.now(), 
              roles,
              googleId: profile.id,
            });

            // Auto-create Restaurant document for restaurant role
            if (intendedRole === 'restaurant') {
              await Restaurant.create({
                name: `${profile.displayName}'s Restaurant`,
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
                phone: '',
                email: email,
                isApproved: false,
                isActive: true
              });
            }

            // Auto-create Provider document for delivery-partner role
            if (intendedRole === 'delivery-partner') {
              await Provider.create({
                userId: user._id,
                businessName: `${profile.displayName}'s Delivery Service`,
                description: 'Please update your delivery partner details',
                address: '',
                phone: '',
                isActive: true
              });
            }

            return done(null, user);
          }

          // Fallback (shouldn't reach here, but just in case)
          if (user) {
            return done(null, user);
          }

          // Create new user if none exists (default behavior)
          user = await User.create({
            email,
            fullName: profile.displayName,
            password: 'google-oauth-' + Date.now(),
            roles: ['user'],
            googleId: profile.id,
          });

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
