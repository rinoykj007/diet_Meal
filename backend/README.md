# Exact Meal Design - Backend API

MongoDB + Express + Node.js backend for the Exact Meal Design application.

## Features

- User authentication with JWT
- Role-based access control (User, Provider, Admin)
- RESTful API endpoints
- MongoDB database with Mongoose ODM
- Secure password hashing with bcrypt
- Error handling middleware

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your settings:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exact-meal-design
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

## Running the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Providers
- `GET /api/providers` - Get all active providers
- `GET /api/providers/:id` - Get single provider
- `POST /api/providers` - Create provider profile (Protected)
- `PUT /api/providers/:id` - Update provider (Protected)
- `DELETE /api/providers/:id` - Delete provider (Protected)

### Diet Plans
- `GET /api/diet-plans` - Get all active diet plans
- `GET /api/diet-plans/:id` - Get single diet plan
- `POST /api/diet-plans` - Create diet plan (Protected, Provider only)
- `PUT /api/diet-plans/:id` - Update diet plan (Protected)
- `DELETE /api/diet-plans/:id` - Delete diet plan (Protected)

### Health Check
- `GET /health` - Server health check

## Database Models

- **User** - User accounts with authentication
- **Provider** - Hotel/meal provider profiles
- **DietPlan** - Diet plans offered by providers
- **Meal** - Individual meals in diet plans
- **Subscription** - User subscriptions to diet plans
- **Order** - Meal orders
- **Notification** - User notifications
- **ProviderAvailability** - Provider unavailable dates
- **AIDietPreference** - User dietary preferences for AI recommendations

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- MongoDB injection protection
- CORS enabled

## Project Structure

```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── providerController.js
│   └── dietPlanController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Provider.js
│   ├── DietPlan.js
│   ├── Meal.js
│   ├── Subscription.js
│   ├── Order.js
│   ├── Notification.js
│   ├── ProviderAvailability.js
│   └── AIDietPreference.js
├── routes/
│   ├── authRoutes.js
│   ├── providerRoutes.js
│   └── dietPlanRoutes.js
├── utils/
│   └── generateToken.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```
