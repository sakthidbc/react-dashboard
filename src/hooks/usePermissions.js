import { useSelector } from 'react-redux';
import { can, canAccessModule, getModuleAbilities } from '../utils/permissions';

/**
 * Hook to check user permissions
 * Similar to Filament's authorization system
 */
export const usePermissions = () => {
  const permissions = useSelector((state) => state.auth.permissions) || {};
  const roles = useSelector((state) => state.auth.roles) || [];

  /**
   * Check if user has permission for a module and action
   * @param {string} module - Module name (e.g., 'slider_images', 'categories')
   * @param {string} action - Action name (e.g., 'create', 'read', 'update', 'delete')
   * @returns {boolean}
   */
  const hasPermission = (module, action) => {
    return can(permissions, module, action);
  };


  /**
   * Check if user has any permission for a module
   * @param {string} module - Module name
   * @returns {boolean}
   */
  const hasModuleAccess = (module) => {
    return canAccessModule(permissions, module);
  };

  /**
   * Check if user has a specific role
   * @param {string} roleName - Role name
   * @returns {boolean}
   */
  const hasRole = (roleName) => {
    return roles.includes(roleName);
  };

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roleNames - Array of role names
   * @returns {boolean}
   */
  const hasAnyRole = (roleNames) => {
    return roleNames.some(roleName => roles.includes(roleName));
  };

  /**
   * Get all permissions for a module
   * @param {string} module - Module name
   * @returns {string[]}
   */
  const getModulePermissions = (module) => {
    return getModuleAbilities(permissions, module);
  };

  /**
   * Check if user can view a module (has read/view permission)
   */
  const canView = (module) => {
    return hasPermission(module, 'read') || hasPermission(module, 'view');
  };

  /**
   * Check if user can create in a module
   */
  const canCreate = (module) => {
    return hasPermission(module, 'create');
  };

  /**
   * Check if user can update in a module
   */
  const canUpdate = (module) => {
    return hasPermission(module, 'update') || hasPermission(module, 'edit');
  };

  /**
   * Check if user can delete in a module
   */
  const canDelete = (module) => {
    return hasPermission(module, 'delete');
  };

  return {
    permissions,
    roles,
    hasPermission,
    hasModuleAccess,
    hasRole,
    hasAnyRole,
    getModulePermissions,
    canView,
    canCreate,
    canUpdate,
    canDelete,
  };
};

