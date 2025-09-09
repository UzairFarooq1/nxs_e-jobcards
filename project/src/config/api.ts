// API Configuration for different environments
export const API_CONFIG = {
  // Development (local)
  development: {
    baseUrl: 'http://localhost:3001/api',
    timeout: 10000,
  },
  
  // Production (Railway)
  production: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://your-backend.railway.app/api',
    timeout: 15000,
  },
  
  // Get current environment
  getCurrent: () => {
    return import.meta.env.MODE === 'production' ? 'production' : 'development';
  },
  
  // Get API base URL for current environment
  getBaseUrl: () => {
    const env = API_CONFIG.getCurrent();
    return API_CONFIG[env].baseUrl;
  },
  
  // Get timeout for current environment
  getTimeout: () => {
    const env = API_CONFIG.getCurrent();
    return API_CONFIG[env].timeout;
  }
};

export default API_CONFIG;
