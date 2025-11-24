import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Protected route that also checks for specific permission
 * Similar to Filament's authorization
 * 
 * Usage:
 * <ProtectedRouteWithPermission module="slider_images" action="read">
 *   <YourComponent />
 * </ProtectedRouteWithPermission>
 */
const ProtectedRouteWithPermission = ({ children, module, action = 'read' }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { hasPermission } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (module && !hasPermission(module, action)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRouteWithPermission;

