# Chapter 4: Implementation

## 4.1 Method

The development method used for this project is the MERN stack method, which consists of four main technologies:

- **MongoDB**: A NoSQL database used to store user profiles, meal plans, restaurant data, orders, and shopping lists. MongoDB's flexible schema design allows for easy adaptation to changing data requirements.

- **Express.js**: A web application framework for Node.js that handles server-side routing, middleware, and API endpoint management. Express.js provides the RESTful API infrastructure for all platform features.

- **React**: A JavaScript library for building user interfaces. The frontend is built using React with TypeScript, providing type safety and better code maintainability. React's component-based architecture enables reusable UI elements across different user dashboards.

- **Node.js**: A JavaScript runtime environment that executes server-side code. Node.js enables the backend to handle concurrent requests efficiently, particularly important for AI diet generation and real-time order tracking.

The MERN stack was chosen for this project because it provides a unified JavaScript ecosystem across both frontend and backend, reducing context switching and enabling faster development cycles. Additionally, the stack's popularity ensures extensive community support and readily available packages for common functionalities.

## 4.2 Implementation Overview

Building and launching a new program as a student is very challenging, and for that reason, I tested my site again and again during the development phase. The implementation phase focused on creating a robust, scalable platform that integrates AI-powered diet planning with restaurant ordering and grocery shopping features.

The implementation followed an iterative development approach, where each major feature was developed, tested, and refined before moving to the next. This approach ensured that core functionalities were stable before adding additional complexity.

### 4.2.1 AI Diet Generation System

The AI diet generation system represents the core innovation of the platform. The implementation uses the Mifflin-St Jeor equation for calculating Basal Metabolic Rate (BMR), which is more accurate than the older Harris-Benedict equation.

![BMR Calculation Code](screenshots/implementation/bmr-calculation-code.png)
*Figure 4.1: BMR calculation implementation using the Mifflin-St Jeor equation*

The BMR calculation considers the user's age, weight, height, and gender. For male users, the formula is: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5. For female users: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161.

![TDEE Calculation Code](screenshots/implementation/tdee-calculation-code.png)
*Figure 4.2: Total Daily Energy Expenditure (TDEE) calculation with activity factors*

The Total Daily Energy Expenditure (TDEE) is calculated by multiplying the BMR by an activity factor ranging from 1.2 (sedentary) to 1.9 (very active). This TDEE value forms the foundation for personalized meal planning.

![Meal Budget Distribution Code](screenshots/implementation/meal-budget-code.png)
*Figure 4.3: Meal budget distribution allocating daily calories across breakfast, lunch, dinner, and snacks*

The meal budget distribution allocates the daily caloric target across four meal categories: breakfast (25%), lunch (35%), dinner (30%), and snacks (10%). This distribution aligns with nutritional best practices for energy distribution throughout the day.

![OpenRouter Integration](screenshots/implementation/openrouter-integration.png)
*Figure 4.4: OpenRouter SDK integration with Mistral AI model for meal generation*

The AI integration utilizes OpenRouter SDK with the Mistral AI model (mistralai/devstral-2512:free) to generate personalized meal recommendations.

![AI Streaming SSE Code](screenshots/implementation/ai-streaming-code.png)
*Figure 4.5: Server-Sent Events (SSE) implementation for real-time AI response streaming*

The system implements Server-Sent Events (SSE) to stream AI responses in real-time, providing users with immediate feedback during the generation process. This streaming approach improves user experience by showing progressive updates rather than waiting for the complete response.

### 4.2.2 Authentication and Authorization System

The authentication system implements JSON Web Token (JWT) based authentication with bcrypt password hashing using 10 salt rounds. The system supports both traditional email/password registration and Google OAuth 2.0 integration for simplified user onboarding.

Role-Based Access Control (RBAC) manages permissions across four user types: regular users, restaurant owners, delivery partners, and administrators. Each role has specific access rights to different platform features and dashboards. The authorization middleware validates JWT tokens on protected routes and verifies role permissions before allowing access to role-specific endpoints.

### 4.2.3 Restaurant Discovery and Ordering System

The restaurant discovery system allows users to browse nearby restaurants, view menus with detailed nutritional information, and place custom orders. The implementation includes a macro scoring algorithm that evaluates each menu item on a 0-100 scale based on how well it aligns with the user's dietary goals.

Restaurant owners have dedicated dashboards where they can manage their menu items, update nutritional information, track incoming orders, and update order statuses in real-time. The order management system implements state transitions from pending to confirmed, preparing, ready, and completed states.

### 4.2.4 Shopping and Delivery System

The shopping cart and delivery system enables users to purchase meal ingredients directly through the platform. Users can add ingredients from their AI-generated meal plans or browse the ingredient catalog independently. The implementation includes inventory management, price tracking, and delivery partner assignment.

Delivery partners receive orders through their dedicated dashboard, which shows order details, delivery addresses, and navigation assistance. The system tracks delivery status through multiple states: assigned, picked up, in transit, and delivered.

### 4.2.5 Dashboard Implementations

Each user role has a customized dashboard tailored to their specific needs. Regular users see their AI-generated meal plans, active orders, shopping cart, and nutritional progress. Restaurant owners view incoming orders, menu management tools, and analytics. Delivery partners see assigned deliveries with route information. Administrators have access to platform-wide analytics, user management, and system configuration tools.

## 4.3 Key Implementation Challenges

Several technical challenges emerged during implementation:

**Challenge 1: AI Response Streaming** - Implementing real-time streaming of AI responses required careful handling of Server-Sent Events (SSE) and proper error handling for network interruptions. The solution involved implementing automatic reconnection logic and buffering partial responses.

**Challenge 2: Nutritional Data Accuracy** - Ensuring accurate nutritional calculations across different meal combinations required extensive validation and testing of the macro scoring algorithms. The system was refined through multiple iterations based on nutritional expert feedback.

**Challenge 3: Role-Based Access Control** - Managing complex permissions across four different user types required careful design of the authorization middleware. The implementation uses a hierarchical permission model where administrators have access to all features, while other roles have specific access patterns.

**Challenge 4: Real-Time Order Updates** - Synchronizing order status across user, restaurant, and delivery partner dashboards required implementing efficient state management and update propagation mechanisms.

## 4.4 Technology Stack Summary

The complete technology stack includes:

**Frontend:**
- React 18 with TypeScript
- Vite build tool
- TanStack Query for state management
- Tailwind CSS for styling
- Lucide React for icons

**Backend:**
- Node.js runtime
- Express.js framework
- MongoDB database with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- OpenRouter SDK for AI integration

**External Services:**
- Google OAuth 2.0 for authentication
- OpenRouter API for AI meal generation
- Mistral AI model (devstral-2512:free)

## 4.5 Conclusion

The implementation successfully delivers a comprehensive diet planning and food ordering platform that integrates AI recommendations with practical meal acquisition options. The MERN stack proved to be an effective choice, enabling rapid development while maintaining code quality and scalability.

Future enhancements could include mobile application development, integration with fitness tracking devices, expanded AI models for specialized diets (keto, vegan, etc.), and machine learning-based personalization that learns from user preferences over time. Additionally, implementing a rating and review system for restaurants and delivery partners would enhance trust and quality control within the platform.
