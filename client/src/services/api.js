import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const verifyToken = async () => {
  const response = await api.get('/auth/verify');
  return response.data;
};

// Ingredients API
export const getIngredients = async () => {
  const response = await api.get('/ingredients');
  return response.data;
};

export const getIngredientById = async (id) => {
  const response = await api.get(`/ingredients/${id}`);
  return response.data;
};

export const searchIngredients = async (query) => {
  const response = await api.get(`/ingredients/search/${query}`);
  return response.data;
};

// Calculator API
export const calculateMeal = async (ingredients) => {
  const response = await api.post('/calculator/meal', { ingredients });
  return response.data;
};

export const calculateIngredient = async (ingredientId, quantity) => {
  const response = await api.post('/calculator/ingredient', {
    ingredient_id: ingredientId,
    quantity,
  });
  return response.data;
};

// Meals API
export const getMeals = async (userId = null) => {
  const params = userId ? { user_id: userId } : {};
  const response = await api.get('/meals', { params });
  return response.data;
};

export const getMealById = async (id) => {
  const response = await api.get(`/meals/${id}`);
  return response.data;
};

export const createMeal = async (mealData) => {
  const response = await api.post('/meals', mealData);
  return response.data;
};

export const logMeal = async (mealId, userId, date) => {
  const response = await api.post(`/meals/${mealId}/log`, {
    user_id: userId,
    date,
  });
  return response.data;
};

// Recommendations API
export const getAlternatives = async (ingredientId) => {
  const response = await api.get(`/recommendations/alternatives/${ingredientId}`);
  return response.data;
};

export const getMealRecommendations = async (ingredients) => {
  const response = await api.post('/recommendations/meal', { ingredients });
  return response.data;
};

// Tracker API
export const getWeeklyTracker = async (userId, weekStart) => {
  const params = weekStart ? { week_start: weekStart } : {};
  const response = await api.get(`/tracker/weekly/${userId}`, { params });
  return response.data;
};

export const getWeeklyHistory = async (userId, limit = 12) => {
  const response = await api.get(`/tracker/weekly/${userId}/history`, {
    params: { limit },
  });
  return response.data;
};

export const getDailyMeals = async (userId, startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await api.get(`/tracker/daily/${userId}`, { params });
  return response.data;
};

export const getStats = async (userId) => {
  const response = await api.get(`/tracker/stats/${userId}`);
  return response.data;
};

// Insights API
export const getMealPatterns = async (userId) => {
  const response = await api.get(`/insights/patterns/${userId}`);
  return response.data;
};

export const getNutritionInsights = async (userId) => {
  const response = await api.get(`/insights/nutrition/${userId}`);
  return response.data;
};

export default {
  login,
  register,
  verifyToken,
  getIngredients,
  getIngredientById,
  searchIngredients,
  calculateMeal,
  calculateIngredient,
  getMeals,
  getMealById,
  createMeal,
  logMeal,
  getAlternatives,
  getMealRecommendations,
  getWeeklyTracker,
  getWeeklyHistory,
  getDailyMeals,
  getStats,
  getMealPatterns,
  getNutritionInsights,
};

