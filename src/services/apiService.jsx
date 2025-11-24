import axios from 'axios';
import { API_URL, STORAGE_URL } from '../config/api';

// Create axios instance with centralized configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // List of public API routes that don't require authentication
      const publicApiRoutes = ['/slider-images/active', '/login', '/register', '/forgot-password'];
      const requestUrl = error.config?.url || '';
      const isPublicApiRoute = publicApiRoutes.some(route => requestUrl.includes(route));
      
      // Get current pathname
      const currentPath = window.location.pathname;
      const isOnAdminRoute = currentPath.startsWith('/admin');
      const isOnLoginPage = currentPath === '/admin/login' || currentPath === '/admin/register';
      
      // Only redirect if:
      // 1. It's not a public API route
      // 2. We're on an admin route (not website)
      // 3. We're not already on the login/register page
      if (!isPublicApiRoute && isOnAdminRoute && !isOnLoginPage) {
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      }
      // For public routes or website routes, just remove token but don't redirect
      else if (!isPublicApiRoute) {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export const login = (email, password) => {
  return api.post('/login', { email, password });
};

export const register = (name, email, password, password_confirmation) => {
  return api.post('/register', { name, email, password, password_confirmation });
};

export const logout = () => {
  return api.post('/logout');
};

export const getUser = () => {
  return api.get('/user');
};

export const forgotPassword = (email) => {
  return api.post('/forgot-password', { email });
};

export const getDashboardData = () => {
  return api.get('/data');
};

export const updateProfile = (formData) => {
  return api.post('/profile/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const changePassword = (data) => {
  return api.post('/profile/change-password', data);
};

// Settings - User settings (legacy, kept for backward compatibility)
export const getSettings = () => {
  return api.get('/settings');
};

export const updateSettings = (data) => {
  return api.post('/settings/user', data);
};

// Slider Images API
export const getSliderImages = () => {
  return api.get('/slider-images');
};

export const getActiveSliderImages = () => {
  return api.get('/slider-images/active');
};

export const createSliderImage = (formData) => {
  return api.post('/slider-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateSliderImage = (id, formData) => {
  return api.post(`/slider-images/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteSliderImage = (id) => {
  return api.delete(`/slider-images/${id}`);
};

// Categories API
export const getCategories = () => {
  return api.get('/categories');
};

export const getCategory = (id) => {
  return api.get(`/categories/${id}`);
};

export const createCategory = (data) => {
  return api.post('/categories', data);
};

export const updateCategory = (id, data) => {
  return api.put(`/categories/${id}`, data);
};

export const deleteCategory = (id) => {
  return api.delete(`/categories/${id}`);
};

// News API
export const getNews = () => {
  return api.get('/news');
};

export const getNewsItem = (id) => {
  return api.get(`/news/${id}`);
};

export const createNews = (formData) => {
  return api.post('/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateNews = (id, formData) => {
  return api.post(`/news/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteNews = (id) => {
  return api.delete(`/news/${id}`);
};

// Menus API
export const getMenus = () => {
  return api.get('/menus');
};

export const getMenu = (id) => {
  return api.get(`/menus/${id}`);
};

export const createMenu = (data) => {
  return api.post('/menus', data);
};

export const updateMenu = (id, data) => {
  return api.put(`/menus/${id}`, data);
};

export const deleteMenu = (id) => {
  return api.delete(`/menus/${id}`);
};

// Restore API
export const getDeletedItems = () => {
  return api.get('/restore');
};

export const restoreItem = (module, id) => {
  return api.post('/restore', { module, id });
};

export const restoreMultipleItems = (items) => {
  return api.post('/restore/multiple', { items });
};

export const forceDeleteItem = (module, id) => {
  return api.post('/restore/force-delete', { module, id });
};

export const forceDeleteMultipleItems = (items) => {
  return api.post('/restore/force-delete/multiple', { items });
};

// Helper function to get image URL from backend
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Use centralized STORAGE_URL
  // If path already starts with /storage/ or storage/, use it directly
  if (imagePath.startsWith('/storage/')) {
    return `${API_URL.replace('/api', '')}${imagePath}`;
  }
  
  if (imagePath.startsWith('storage/')) {
    return `${STORAGE_URL}/${imagePath.replace('storage/', '')}`;
  }
  
  // If path doesn't start with storage, add it
  // Remove leading slash from imagePath if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `${STORAGE_URL}/${cleanPath}`;
};

// Roles & Permissions
export const getRoles = () => {
  return api.get('/roles');
};

export const getRole = (id) => {
  return api.get(`/roles/${id}`);
};

export const createRole = (data) => {
  return api.post('/roles', data);
};

export const updateRole = (id, data) => {
  return api.put(`/roles/${id}`, data);
};

export const deleteRole = (id) => {
  return api.delete(`/roles/${id}`);
};

export const getPermissionOptions = () => {
  return api.get('/roles/permissions/options');
};

// Users
export const getUsers = () => {
  return api.get('/users');
};

export const getUserById = (id) => {
  return api.get(`/users/${id}`);
};

export const createUser = (data) => {
  return api.post('/users', data);
};

export const updateUser = (id, data) => {
  return api.put(`/users/${id}`, data);
};

export const deleteUser = (id) => {
  return api.delete(`/users/${id}`);
};

export const getUserRoles = () => {
  return api.get('/users/roles/list');
};

export const getUserPermissions = () => {
  return api.get('/users/permissions/me');
};

// Pages
export const getPages = () => {
  return api.get('/pages');
};

export const getPage = (id) => {
  return api.get(`/pages/${id}`);
};

export const createPage = (formData) => {
  return api.post('/pages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updatePage = (id, formData) => {
  // Laravel apiResource expects PUT, but for file uploads we need POST with _method
  formData.append('_method', 'PUT');
  return api.post(`/pages/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deletePage = (id) => {
  return api.delete(`/pages/${id}`);
};

// Photo Galleries
export const getPhotoGalleries = () => {
  return api.get('/photo-galleries');
};

export const getPhotoGallery = (id) => {
  return api.get(`/photo-galleries/${id}`);
};

export const createPhotoGallery = (formData) => {
  return api.post('/photo-galleries', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updatePhotoGallery = (id, formData) => {
  // Laravel apiResource expects PUT, but for file uploads we need POST with _method
  formData.append('_method', 'PUT');
  return api.post(`/photo-galleries/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deletePhotoGallery = (id) => {
  return api.delete(`/photo-galleries/${id}`);
};

// Video Galleries
export const getVideoGalleries = () => {
  return api.get('/video-galleries');
};

export const getVideoGallery = (id) => {
  return api.get(`/video-galleries/${id}`);
};

export const createVideoGallery = (data) => {
  return api.post('/video-galleries', data);
};

export const updateVideoGallery = (id, data) => {
  // If data is FormData, use POST with _method
  if (data instanceof FormData) {
    data.append('_method', 'PUT');
    return api.post(`/video-galleries/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.put(`/video-galleries/${id}`, data);
};

export const deleteVideoGallery = (id) => {
  return api.delete(`/video-galleries/${id}`);
};

// Album Galleries
export const getAlbumGalleries = () => {
  return api.get('/album-galleries');
};

export const getAlbumGallery = (id) => {
  return api.get(`/album-galleries/${id}`);
};

export const createAlbumGallery = (formData) => {
  return api.post('/album-galleries', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateAlbumGallery = (id, formData) => {
  formData.append('_method', 'PUT');
  return api.post(`/album-galleries/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteAlbumGallery = (id) => {
  return api.delete(`/album-galleries/${id}`);
};

// Popups
export const getPopups = () => {
  return api.get('/popups');
};

export const getPopup = (id) => {
  return api.get(`/popups/${id}`);
};

export const createPopup = (formData) => {
  return api.post('/popups', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updatePopup = (id, formData) => {
  formData.append('_method', 'PUT');
  return api.post(`/popups/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deletePopup = (id) => {
  return api.delete(`/popups/${id}`);
};

// Social Icons
export const getSocialIcons = () => {
  return api.get('/social-icons');
};

export const getSocialIcon = (id) => {
  return api.get(`/social-icons/${id}`);
};

export const getAvailableIcons = () => {
  // Return default icons since backend doesn't have an endpoint for this
  return Promise.resolve({
    data: {
      facebook: 'Facebook',
      twitter: 'Twitter',
      x: 'X (Twitter)',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      pinterest: 'Pinterest',
      tiktok: 'TikTok',
      snapchat: 'Snapchat',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      discord: 'Discord',
      github: 'GitHub',
      dribbble: 'Dribbble',
      behance: 'Behance',
      medium: 'Medium',
      reddit: 'Reddit',
      vimeo: 'Vimeo',
      skype: 'Skype',
      email: 'Email',
      website: 'Website',
    }
  });
};

export const createSocialIcon = (data) => {
  return api.post('/social-icons', data);
};

export const updateSocialIcon = (id, data) => {
  return api.put(`/social-icons/${id}`, data);
};

export const deleteSocialIcon = (id) => {
  return api.delete(`/social-icons/${id}`);
};

// Floating Menus
export const getFloatingMenus = () => {
  return api.get('/floating-menus');
};

export const getFloatingMenu = (id) => {
  return api.get(`/floating-menus/${id}`);
};

export const createFloatingMenu = (data) => {
  return api.post('/floating-menus', data);
};

export const updateFloatingMenu = (id, data) => {
  return api.put(`/floating-menus/${id}`, data);
};

export const deleteFloatingMenu = (id) => {
  return api.delete(`/floating-menus/${id}`);
};

// Daily Thoughts
export const getDailyThoughts = () => {
  return api.get('/daily-thoughts');
};

export const getDailyThought = (id) => {
  return api.get(`/daily-thoughts/${id}`);
};

export const createDailyThought = (data) => {
  return api.post('/daily-thoughts', data);
};

export const updateDailyThought = (id, data) => {
  return api.put(`/daily-thoughts/${id}`, data);
};

export const deleteDailyThought = (id) => {
  return api.delete(`/daily-thoughts/${id}`);
};

// Module Builder
export const getModuleBuilders = () => {
  return api.get('/module-builder');
};

export const getModuleBuilder = (id) => {
  return api.get(`/module-builder/${id}`);
};

export const createModuleBuilder = (data) => {
  return api.post('/module-builder', data);
};

export const updateModuleBuilder = (id, data) => {
  return api.put(`/module-builder/${id}`, data);
};

export const deleteModuleBuilder = (id) => {
  return api.delete(`/module-builder/${id}`);
};

export const generateModule = (id) => {
  return api.post(`/module-builder/${id}/generate`);
};

export const getFieldTypes = () => {
  return api.get('/module-builder/field-types');
};

// Logs
export const getLogs = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/logs${queryString ? `?${queryString}` : ''}`);
};

export const getLogStatistics = () => {
  return api.get('/logs/statistics');
};

export const getLogFilterOptions = () => {
  return api.get('/logs/filter-options');
};

export const deleteLog = (id) => {
  return api.delete(`/logs/${id}`);
};

export const restoreLog = (id) => {
  return api.post(`/logs/${id}/restore`);
};

// Contact List
export const getContactList = (params = '') => {
  return api.get(`/contact-us${params ? '?' + params : ''}`);
};

export const getContact = (id) => {
  return api.get(`/contact-us/${id}`);
};

export const deleteContact = (id) => {
  return api.delete(`/contact-us/${id}`);
};

// Settings - Additional methods
export const updateUserSettings = (data) => {
  return api.post('/settings/user', data);
};

export const updateSystemSettings = (data) => {
  return api.post('/settings/system', data);
};

export const uploadLogo = (data) => {
  return api.post('/settings/logo', data);
};

export const getSettingsUsers = () => {
  return api.get('/settings/users');
};

export const toggleUserBlock = (userId) => {
  return api.post(`/settings/users/${userId}/toggle-block`);
};

export default api;
