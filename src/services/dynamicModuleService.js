import api from './apiService';
import { isFormData } from '../utils/formDataHelper';

/**
 * Create API service for a dynamic module
 */
export const createDynamicModuleService = (moduleName, routeName) => {
  return {
    getItems: () => api.get(`/${routeName}`),
    getItem: (id) => api.get(`/${routeName}/${id}`),
    createItem: (data) => {
      if (isFormData(data)) {
        return api.post(`/${routeName}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return api.post(`/${routeName}`, data);
    },
    updateItem: (id, data) => {
      if (isFormData(data)) {
        data.append('_method', 'PUT');
        return api.post(`/${routeName}/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return api.put(`/${routeName}/${id}`, data);
    },
    deleteItem: (id) => api.delete(`/${routeName}/${id}`),
  };
};

// Cache for dynamic modules
let modulesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all dynamic modules from backend (cached)
 */
export const getDynamicModules = async (forceRefresh = false) => {
  try {
    // Return cached data if available and not expired
    if (!forceRefresh && modulesCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      return modulesCache;
    }

    // Try the active endpoint first (no permission required)
    try {
      const response = await api.get('/module-builder/active');
      modulesCache = response.data || [];
      cacheTimestamp = Date.now();
      return modulesCache;
    } catch (activeError) {
      // Fallback to full endpoint if active endpoint fails
      const response = await api.get('/module-builder');
      const filtered = response.data.filter(module => module.is_generated && module.is_active);
      modulesCache = filtered;
      cacheTimestamp = Date.now();
      return modulesCache;
    }
  } catch (error) {
    console.error('Failed to fetch dynamic modules:', error);
    // Return cached data even if expired, as fallback
    if (modulesCache) {
      return modulesCache;
    }
    return [];
  }
};

/**
 * Clear the modules cache
 */
export const clearModulesCache = () => {
  modulesCache = null;
  cacheTimestamp = null;
};

/**
 * Convert module config to route config
 */
export const moduleToRouteConfig = (module) => {
  const routeName = module.table_name || module.name; // Fallback to name if table_name not available
  const moduleLabel = module.label;
  
  return {
    name: routeName, // Use table_name for permission checks (this is what's stored in permissions)
    label: moduleLabel,
    routePath: `/admin/dashboard/${routeName}`,
    apiRoute: routeName,
    fields: module.fields || [],
    category: 'Content Management', // Default category
  };
};

