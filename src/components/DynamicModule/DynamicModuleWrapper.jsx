import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DynamicList from './DynamicList';
import DynamicForm from './DynamicForm';
import { getDynamicModules, moduleToRouteConfig, createDynamicModuleService } from '../../services/dynamicModuleService';
import { Loader } from 'lucide-react';

const DynamicModuleWrapper = ({ type = 'list' }) => {
  const { id } = useParams();
  const [moduleConfig, setModuleConfig] = useState(null);
  const [apiService, setApiService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModule();
  }, []);

  const loadModule = async () => {
    try {
      setIsLoading(true);
      // Get module name from URL
      // URL format: /admin/dashboard/:moduleName or /admin/dashboard/:moduleName/create or /admin/dashboard/:moduleName/edit/:id
      const pathParts = window.location.pathname.split('/').filter(p => p);
      const moduleRoute = pathParts[pathParts.indexOf('dashboard') + 1];
      
      if (!moduleRoute || moduleRoute === 'create' || moduleRoute === 'edit') {
        setError('Invalid module route');
        return;
      }
      
      // Fetch all dynamic modules
      const modules = await getDynamicModules();
      const module = modules.find(m => m.table_name === moduleRoute);
      
      if (!module) {
        setError(`Module "${moduleRoute}" not found`);
        return;
      }

      const config = moduleToRouteConfig(module);
      const service = createDynamicModuleService(module.name, module.table_name);
      
      setModuleConfig(config);
      setApiService(service);
    } catch (err) {
      setError(err.message || 'Failed to load module');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!moduleConfig || !apiService) {
    return null;
  }

  if (type === 'form') {
    return <DynamicForm moduleConfig={moduleConfig} apiService={apiService} />;
  }

  return <DynamicList moduleConfig={moduleConfig} apiService={apiService} />;
};

export default DynamicModuleWrapper;

