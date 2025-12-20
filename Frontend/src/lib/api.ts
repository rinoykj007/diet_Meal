import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; fullName: string; phone?: string }) =>
    api.post('/auth/register', data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data: { fullName?: string; phone?: string; avatarUrl?: string }) =>
    api.put('/auth/profile', data),

  // Admin functions
  updateUserRole: (userId: string, roles: string[]) =>
    api.put(`/auth/users/${userId}/role`, { roles }),

  resetUserPassword: (userId: string, newPassword: string) =>
    api.put(`/auth/users/${userId}/password`, { newPassword }),
};

// Provider API
export const providerAPI = {
  getAll: () => api.get('/providers'),

  getById: (id: string) => api.get(`/providers/${id}`),

  create: (data: { businessName: string; description?: string; address?: string; phone?: string; logoUrl?: string }) =>
    api.post('/providers', data),

  update: (id: string, data: any) => api.put(`/providers/${id}`, data),

  delete: (id: string) => api.delete(`/providers/${id}`),
};

// Diet Plan API
export const dietPlanAPI = {
  getAll: (params?: { providerId?: string; minPrice?: number; maxPrice?: number }) =>
    api.get('/diet-plans', { params }),

  getById: (id: string) => api.get(`/diet-plans/${id}`),

  create: (data: {
    name: string;
    description?: string;
    price: number;
    durationDays?: number;
    caloriesPerDay?: number;
  }) => api.post('/diet-plans', data),

  update: (id: string, data: any) => api.put(`/diet-plans/${id}`, data),

  delete: (id: string) => api.delete(`/diet-plans/${id}`),
};

// Meal API
export const mealAPI = {
  getByDietPlan: (dietPlanId: string) =>
    api.get(`/meals?dietPlanId=${dietPlanId}`),

  create: (data: {
    dietPlanId: string;
    name: string;
    description?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    imageUrl?: string;
  }) => api.post('/meals', data),

  update: (id: string, data: any) => api.put(`/meals/${id}`, data),

  delete: (id: string) => api.delete(`/meals/${id}`),
};

// Subscription API
export const subscriptionAPI = {
  getMySubscriptions: () => api.get('/subscriptions/my'),

  create: (data: {
    dietPlanId: string;
    providerId: string;
    startDate: string;
    endDate?: string;
  }) => api.post('/subscriptions', data),

  update: (id: string, data: { status?: string; endDate?: string }) =>
    api.put(`/subscriptions/${id}`, data),

  cancel: (id: string) =>
    api.put(`/subscriptions/${id}`, { status: 'cancelled' }),
};

// Restaurant API
export const restaurantAPI = {
  getAll: (params?: { dietType?: string; search?: string }) =>
    api.get('/restaurants', { params }),

  getAllAdmin: (params?: { isApproved?: boolean; isActive?: boolean; search?: string }) =>
    api.get('/restaurants/admin/all', { params }),

  getById: (id: string) => api.get(`/restaurants/${id}`),

  getMyRestaurant: () => api.get('/restaurants/my/restaurant'),

  create: (data: {
    name: string;
    description?: string;
    dietTypes: string[];
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    phone?: string;
    email?: string;
    image?: string;
  }) => api.post('/restaurants', data),

  update: (id: string, data: any) => api.put(`/restaurants/${id}`, data),

  delete: (id: string) => api.delete(`/restaurants/${id}`),

  approve: (id: string) => api.put(`/restaurants/${id}/approve`),
};

// Diet Food API
export const dietFoodAPI = {
  getAll: (params?: {
    restaurantId?: string;
    dietType?: string;
    search?: string;
    minCalories?: number;
    maxCalories?: number;
  }) => api.get('/diet-foods', { params }),

  getById: (id: string) => api.get(`/diet-foods/${id}`),

  getByRestaurant: (restaurantId: string, dietType?: string) =>
    api.get(`/diet-foods/restaurant/${restaurantId}`, {
      params: dietType ? { dietType } : undefined,
    }),

  create: (data: {
    restaurantId: string;
    name: string;
    description?: string;
    dietType: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    price: number;
    image?: string;
    images?: string[];
    ingredients?: string[];
    allergens?: string[];
    servingSize?: string;
    preparationTime?: number;
  }) => api.post('/diet-foods', data),

  update: (id: string, data: any) => api.put(`/diet-foods/${id}`, data),

  delete: (id: string) => api.delete(`/diet-foods/${id}`),
};

// Order API
export const orderAPI = {
  getMyOrders: (params?: { status?: string; orderType?: string }) =>
    api.get('/orders', { params }),

  getAllOrders: (params?: { status?: string; orderType?: string }) =>
    api.get('/orders/all', { params }),

  getById: (id: string) => api.get(`/orders/${id}`),

  getRestaurantOrders: (restaurantId: string, status?: string) =>
    api.get(`/orders/restaurant/${restaurantId}`, {
      params: status ? { status } : undefined,
    }),

  create: (data: {
    restaurantId: string;
    items: Array<{ dietFoodId: string; quantity: number }>;
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    deliveryDate?: string;
    paymentMethod?: 'cash' | 'card' | 'online' | 'wallet';
    notes?: string;
  }) => api.post('/orders', data),

  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),

  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),

  // Custom Recipe Order Methods
  createCustomRecipeOrder: (data: {
    restaurantId: string;
    recipeDetails: {
      recipeName: string;
      description: string;
      ingredients: string[];
      instructions: string;
      calories: number;
      macros: {
        protein: number;
        carbs: number;
        fats: number;
      };
      mealType: string;
    };
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    deliveryDate?: string;
    notes?: string;
  }) => api.post('/orders/custom-recipe', data),

  quotePrice: (orderId: string, price: number) =>
    api.put(`/orders/${orderId}/quote-price`, { price }),

  acceptQuote: (orderId: string) =>
    api.put(`/orders/${orderId}/accept-quote`),

  rejectQuote: (orderId: string) =>
    api.put(`/orders/${orderId}/reject-quote`),
};

// Notification API
export const notificationAPI = {
  getMyNotifications: (params?: { isRead?: boolean; limit?: number; page?: number }) =>
    api.get('/notifications', { params }),

  getUnreadCount: () => api.get('/notifications/unread-count'),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllAsRead: () => api.put('/notifications/mark-all-read'),

  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// AI Diet API
export const aiDietAPI = {
  generateRecommendation: (
    preferences: {
      dietaryRestrictions?: string[];
      healthGoals: string[];
      allergies?: string[];
      preferredCuisines?: string[];
      calorieTarget?: number;
      mealsPerDay?: number;
      activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
      budgetRange?: string;
      additionalNotes?: string;
    },
    onProgress?: (event: {
      type: 'status' | 'content' | 'complete' | 'error';
      data: any;
    }) => void
  ) => {
    // If no progress callback, use regular API call (fallback)
    if (!onProgress) {
      return api.post('/ai-diet/generate', preferences);
    }

    // Use EventSource for Server-Sent Events
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      // Create a fetch request with POST for SSE
      fetch(`${API_URL}/ai-diet/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(preferences),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error('Response body is not readable');
          }

          let buffer = '';
          let currentEvent = 'status';

          const readChunk = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Keep incomplete line in buffer

              for (const line of lines) {
                if (line.startsWith('event:')) {
                  currentEvent = line.substring(6).trim();
                  continue;
                }

                if (line.startsWith('data:')) {
                  try {
                    const data = JSON.parse(line.substring(5).trim());

                    // Call progress callback
                    onProgress({ type: currentEvent as any, data });

                    // Handle completion
                    if (currentEvent === 'complete') {
                      resolve({ data });
                    }

                    // Handle error
                    if (currentEvent === 'error') {
                      reject(new Error(data.message || 'Unknown error'));
                    }
                  } catch (parseError) {
                    console.error('Error parsing SSE data:', parseError);
                  }
                }
              }

              readChunk(); // Continue reading
            });
          };

          readChunk();
        })
        .catch((error) => {
          onProgress({ type: 'error', data: { message: error.message } });
          reject(error);
        });
    });
  },

  getMyRecommendations: (params?: { limit?: number; page?: number }) =>
    api.get('/ai-diet/my-recommendations', { params }),

  getById: (id: string) => api.get(`/ai-diet/${id}`),

  rate: (id: string, rating: number, feedback?: string) =>
    api.put(`/ai-diet/${id}/rate`, { rating, feedback }),

  delete: (id: string) => api.delete(`/ai-diet/${id}`),
};

// Shopping List Request API
export const shoppingListAPI = {
  // Customer methods
  createRequest: (data: {
    mealPlanId: string;
    items: string[];
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country?: string;
    };
    estimatedCost?: number;
    notes?: string;
  }) => api.post('/shopping-requests', data),

  getMyRequests: (params?: { status?: string }) =>
    api.get('/shopping-requests/my-requests', { params }),

  cancelRequest: (id: string) =>
    api.put(`/shopping-requests/${id}/cancel`),

  // Delivery partner methods
  getAvailableRequests: () =>
    api.get('/shopping-requests/available'),

  acceptRequest: (id: string) =>
    api.put(`/shopping-requests/${id}/accept`),

  updateStatus: (id: string, status: string, finalCost?: number) =>
    api.put(`/shopping-requests/${id}/status`, { status, finalCost }),

  getMyDeliveries: (params?: { status?: string }) =>
    api.get('/shopping-requests/my-deliveries', { params }),
};
