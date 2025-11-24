/**
 * Permission system similar to Filament's approach
 * Defines abilities and checks permissions
 */

/**
 * Define all available abilities
 */
export const Abilities = {
  // Slider Images
  SLIDER_IMAGES_VIEW: 'slider_images.view',
  SLIDER_IMAGES_CREATE: 'slider_images.create',
  SLIDER_IMAGES_UPDATE: 'slider_images.update',
  SLIDER_IMAGES_DELETE: 'slider_images.delete',
  
  // Categories
  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',
  
  // News
  NEWS_VIEW: 'news.view',
  NEWS_CREATE: 'news.create',
  NEWS_UPDATE: 'news.update',
  NEWS_DELETE: 'news.delete',
  
  // Menus
  MENUS_VIEW: 'menus.view',
  MENUS_CREATE: 'menus.create',
  MENUS_UPDATE: 'menus.update',
  MENUS_DELETE: 'menus.delete',
  
  // Roles & Permissions
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  
  // Restore
  RESTORE_VIEW: 'restore.view',
  RESTORE_RESTORE: 'restore.restore',
  RESTORE_DELETE: 'restore.delete',
};

/**
 * Map module and action to ability string
 */
export const getAbility = (module, action) => {
  const actionMap = {
    'read': 'view',
    'view': 'view',
    'create': 'create',
    'update': 'update',
    'edit': 'update',
    'delete': 'delete',
    'restore': 'restore',
  };
  
  const mappedAction = actionMap[action] || action;
  return `${module}.${mappedAction}`;
};

/**
 * Check if user has a specific ability
 */
export const can = (permissions, module, action) => {
  if (!permissions || typeof permissions !== 'object') {
    return false;
  }
  
  // Check if module exists in permissions
  if (!permissions[module] || !Array.isArray(permissions[module])) {
    return false;
  }
  
  // Map action to standard format
  const actionMap = {
    'read': 'read',
    'view': 'read',
    'create': 'create',
    'update': 'update',
    'edit': 'update',
    'delete': 'delete',
    'restore': 'restore',
  };
  
  const mappedAction = actionMap[action] || action;
  
  // Check if action is in permissions array
  return permissions[module].includes(mappedAction);
};

/**
 * Check if user has any permission for a module
 */
export const canAccessModule = (permissions, module) => {
  if (!permissions || typeof permissions !== 'object') {
    return false;
  }
  
  return permissions[module] && Array.isArray(permissions[module]) && permissions[module].length > 0;
};

/**
 * Get all abilities for a module
 */
export const getModuleAbilities = (permissions, module) => {
  if (!permissions || !permissions[module]) {
    return [];
  }
  return permissions[module] || [];
};

