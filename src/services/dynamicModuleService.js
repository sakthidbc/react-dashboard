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

/**
 * Get all dynamic modules from backend
 */
export const getDynamicModules = async () => {
  try {
    // Try the active endpoint first (no permission required)
    try {
      const response = await api.get('/module-builder/active');
      return response.data || [];
    } catch (activeError) {
      // Fallback to full endpoint if active endpoint fails
      const response = await api.get('/module-builder');
      const filtered = response.data.filter(module => module.is_generated && module.is_active);
      return filtered;
    }
  } catch (error) {
    console.error('Failed to fetch dynamic modules:', error);
    return [];
  }
};

/**
 * Convert module name to kebab-case route name (matches Laravel's Str::kebab(Str::plural()))
 * This should match the backend route generation exactly
 * 
 * Examples:
 * - ContactUs -> contact-uses
 * - ProductList -> product-lists
 * - Category -> categories
 */
const toKebabCaseRoute = (name) => {
  if (!name) return '';
  
  // Normalize the name (handle case variations)
  const normalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  
  // First, handle pluralization on the original name (before converting to kebab-case)
  // This matches Laravel's Str::plural() behavior
  let pluralName = normalizedName;
  
  // Laravel pluralization rules (common cases)
  const lowerName = normalizedName.toLowerCase();
  
  if (lowerName.endsWith('us') && !lowerName.endsWith('ous')) {
    // ContactUs -> ContactUses, Status -> Statuses
    pluralName = normalizedName.slice(0, -2) + 'Uses';
  } else if (lowerName.endsWith('is')) {
    // Analysis -> Analyses
    pluralName = normalizedName.slice(0, -2) + 'Es';
  } else if (lowerName.endsWith('y') && !/[aeiou]y$/.test(lowerName)) {
    // Category -> Categories, City -> Cities
    pluralName = normalizedName.slice(0, -1) + 'ies';
  } else if (lowerName.endsWith('s') || lowerName.endsWith('x') || lowerName.endsWith('z') || 
             lowerName.endsWith('ch') || lowerName.endsWith('sh') || lowerName.endsWith('ss')) {
    // Box -> Boxes, Class -> Classes
    pluralName = normalizedName + 'es';
  } else if (!lowerName.endsWith('s')) {
    // Default: add 's'
    pluralName = normalizedName + 's';
  }
  
  // Now convert to kebab-case (matches Laravel's Str::kebab())
  // Handle consecutive capitals first, then lowercase-uppercase transitions
  let kebab = pluralName
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // Handle consecutive capitals: "ContactUses" -> "Contact-Uses"
    .replace(/([a-z\d])([A-Z])/g, '$1-$2') // Add dash between lowercase/digit and uppercase
    .toLowerCase();
  
  return kebab;
};

/**
 * Convert module config to route config
 */
export const moduleToRouteConfig = (module) => {
  const tableName = module.table_name || module.name; // Use table_name for permission checks
  // Use route_name from database if available (for generated modules), otherwise generate it
  const routeName = module.route_name || toKebabCaseRoute(module.name);
  const moduleLabel = module.label;
  
  return {
    name: tableName, // Use table_name for permission checks (this is what's stored in permissions)
    label: moduleLabel,
    routePath: `/admin/dashboard/${tableName}`, // Use table_name for route path (matches URL)
    apiRoute: routeName, // Use route_name from DB or generated kebab-case for API routes
    fields: module.fields || [],
    category: 'Content Management', // Default category
  };
};

