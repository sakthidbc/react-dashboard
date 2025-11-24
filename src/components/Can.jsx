import { usePermissions } from '../hooks/usePermissions';

/**
 * Component wrapper for permission-based rendering
 * Similar to Filament's Can component
 * 
 * Usage:
 * <Can module="slider_images" action="create">
 *   <button>Create</button>
 * </Can>
 */
const Can = ({ module, action, children, fallback = null }) => {
  const { hasPermission } = usePermissions();
  
  if (hasPermission(module, action)) {
    return children;
  }
  
  return fallback;
};

export default Can;

