import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Image, Tag, Newspaper, MenuSquare, FileText, Images, Video, 
  Folder, Maximize2, Share2, Navigation, Lightbulb, Users, Shield, RotateCcw, 
  Settings, ArrowRight, Sparkles, Loader, Activity
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser } from '../store/slices/authSlice';
import { getDynamicModules, moduleToRouteConfig } from '../services/dynamicModuleService';
import { Package } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { permissions, isAuthenticated, token } = useSelector((state) => ({
    permissions: state.auth.permissions || {},
    isAuthenticated: state.auth.isAuthenticated,
    token: state.auth.token,
  }));
  const [dynamicModules, setDynamicModules] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const dispatch = useDispatch();

  // Check if user has token (from localStorage or Redux)
  const hasToken = token || localStorage.getItem('token');

  // Fetch user/permissions if not loaded yet - check token instead of isAuthenticated
  useEffect(() => {
    if (hasToken && (!permissions || Object.keys(permissions).length === 0)) {
      dispatch(fetchUser());
    }
  }, [hasToken, permissions, dispatch]);

  // Load modules on mount - only once to avoid excessive API calls
  useEffect(() => {
    // Load modules if we have a token (don't wait for isAuthenticated)
    if (hasToken && dynamicModules.length === 0 && !isLoadingModules) {
      loadDynamicModules();
    }
  }, [hasToken]); // Only depend on hasToken to load once

  // Refresh modules when navigating back to dashboard
  // But only if modules are not already loaded
  useEffect(() => {
    const handleFocus = () => {
      // Only reload if we don't have modules yet
      if (hasToken && dynamicModules.length === 0 && !isLoadingModules) {
        loadDynamicModules();
      }
    };
    
    // Listen for custom events (for same-tab communication)
    const handleModuleChange = () => {
      if (hasToken && !isLoadingModules) {
        loadDynamicModules();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('moduleCacheCleared', handleModuleChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('moduleCacheCleared', handleModuleChange);
    };
  }, [hasToken, dynamicModules.length, isLoadingModules]); // Include isLoadingModules to prevent duplicate calls

  const loadDynamicModules = async () => {
    try {
      setIsLoadingModules(true);
      const modules = await getDynamicModules();
      
      // Deduplicate modules by table_name to prevent duplicates
      const uniqueModules = modules.reduce((acc, module) => {
        const tableName = module.table_name || module.name;
        if (!acc.find(m => (m.table_name || m.name) === tableName)) {
          acc.push(module);
        }
        return acc;
      }, []);
      
      const moduleConfigs = uniqueModules.map(module => {
        const config = moduleToRouteConfig(module);
        return {
          icon: Package,
          label: config.label,
          path: config.routePath,
          module: config.name, // This should be table_name for permissions
          gradient: 'from-blue-500 to-indigo-600',
        };
      });
      
      // Deduplicate module configs by path as well
      const uniqueConfigs = moduleConfigs.reduce((acc, config) => {
        if (!acc.find(c => c.path === config.path)) {
          acc.push(config);
        }
        return acc;
      }, []);
      
      setDynamicModules(uniqueConfigs);
    } catch (error) {
      console.error('Failed to load dynamic modules:', error);
      // Set empty array on error to prevent blocking
      setDynamicModules([]);
    } finally {
      setIsLoadingModules(false);
    }
  };

  // Base menu categories without dynamic modules
  const baseMenuCategories = useMemo(() => [
    {
      title: 'Content Management',
      icon: Folder,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      borderColor: 'border-blue-200 dark:border-blue-800',
      items: [
        { icon: Image, label: 'Slider Images', path: '/admin/dashboard/slider-images', module: 'slider_images', gradient: 'from-indigo-500 to-purple-600' },
        { icon: Tag, label: 'Categories', path: '/admin/dashboard/categories', module: 'categories', gradient: 'from-pink-500 to-rose-600' },
        { icon: Newspaper, label: 'News', path: '/admin/dashboard/news', module: 'news', gradient: 'from-orange-500 to-red-600' },
        { icon: MenuSquare, label: 'Menus', path: '/admin/dashboard/menus', module: 'menus', gradient: 'from-green-500 to-emerald-600' },
        { icon: FileText, label: 'Pages', path: '/admin/dashboard/pages', module: 'pages', gradient: 'from-violet-500 to-purple-600' },
        { icon: Images, label: 'Photo Galleries', path: '/admin/dashboard/photo-galleries', module: 'photo_galleries', gradient: 'from-cyan-500 to-blue-600' },
        { icon: Video, label: 'Video Galleries', path: '/admin/dashboard/video-galleries', module: 'video_galleries', gradient: 'from-red-500 to-pink-600' },
        { icon: Folder, label: 'Album Galleries', path: '/admin/dashboard/album-galleries', module: 'album_galleries', gradient: 'from-amber-500 to-yellow-600' },
        { icon: Maximize2, label: 'Popups', path: '/admin/dashboard/popups', module: 'popups', gradient: 'from-teal-500 to-green-600' },
        { icon: Share2, label: 'Social Icons', path: '/admin/dashboard/social-icons', module: 'social_icons', gradient: 'from-sky-500 to-cyan-600' },
        { icon: Navigation, label: 'Floating Menus', path: '/admin/dashboard/floating-menus', module: 'floating_menus', gradient: 'from-lime-500 to-green-600' },
        { icon: Lightbulb, label: 'Daily Thoughts', path: '/admin/dashboard/daily-thoughts', module: 'daily_thoughts', gradient: 'from-yellow-500 to-orange-600' },
      ],
    },
    {
      title: 'User Management',
      icon: Users,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/10',
      borderColor: 'border-purple-200 dark:border-purple-800',
      items: [
        { icon: Users, label: 'Users', path: '/admin/dashboard/users', module: 'roles', gradient: 'from-blue-500 to-indigo-600' },
        { icon: Shield, label: 'Roles & Permissions', path: '/admin/dashboard/roles', module: 'roles', gradient: 'from-indigo-500 to-purple-600' },
      ],
    },
    {
      title: 'System',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/10',
      borderColor: 'border-gray-200 dark:border-gray-800',
      items: [
        { icon: Activity, label: 'Logs', path: '/admin/dashboard/logs', module: 'logs', gradient: 'from-slate-500 to-gray-600' },
        { icon: RotateCcw, label: 'Restore', path: '/admin/dashboard/restore', module: 'restore', gradient: 'from-slate-500 to-gray-600' },
        { icon: Settings, label: 'Settings', path: '/admin/dashboard/settings', module: null, gradient: 'from-gray-500 to-slate-600' },
      ],
    },
  ], []);

  // Combine base categories with dynamic modules
  const menuCategories = useMemo(() => {
    // Deep clone base categories to avoid mutating the original
    const categories = baseMenuCategories.map(cat => ({
      ...cat,
      items: [...cat.items]
    }));
    
    // Add dynamic modules to Content Management category with deduplication
    if (dynamicModules.length > 0) {
      const contentCategory = categories.find(cat => cat.title === 'Content Management');
      if (contentCategory) {
        // Create a Set of existing module paths to check for duplicates
        const existingPaths = new Set(contentCategory.items.map(item => item.path));
        
        // Filter out duplicates from dynamic modules
        const uniqueDynamicModules = dynamicModules.filter(module => !existingPaths.has(module.path));
        
        // Only add unique modules
        if (uniqueDynamicModules.length > 0) {
          contentCategory.items = [...contentCategory.items, ...uniqueDynamicModules];
        }
      }
    }
    return categories;
  }, [baseMenuCategories, dynamicModules]);

  // Track if permissions are being loaded
  const isLoadingPermissions = !permissions || Object.keys(permissions).length === 0;

  // Filter modules based on permissions
  // Show all modules while loading, then filter once permissions are loaded
  const filteredCategories = useMemo(() => {
    // If permissions are not loaded yet, show all modules (don't filter)
    // This prevents modules from disappearing during loading
    if (isLoadingPermissions && hasToken) {
      return menuCategories;
    }
    
    // Once permissions are loaded, filter based on permissions
    return menuCategories.map(category => ({
      ...category,
      items: category.items.filter(item => {
        if (!item.module) return true;
        return hasPermission(item.module, 'read');
      }),
    })).filter(category => category.items.length > 0);
  }, [menuCategories, permissions, hasPermission, isLoadingPermissions, hasToken]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="p-4 lg:p-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-hover shadow-lg">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quick access to all modules</p>
          </div>
        </div>
      </motion.div>

      {/* Modules by Category */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {filteredCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            variants={itemVariants}
            className="space-y-4"
          >
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${category.color}`}></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className={`p-1.5 rounded-lg bg-gradient-to-br ${category.color}`}>
                  {category.icon ? (
                    <category.icon className="w-5 h-5 text-white" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-white" />
                  )}
                </span>
                {category.title}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700"></div>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {category.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.05,
                      transition: { type: 'spring', stiffness: 400, damping: 17 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`group relative overflow-hidden rounded-2xl p-5 border-2 ${category.borderColor} ${category.bgColor} backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/10 dark:hover:shadow-gray-900/50`}
                  >
                    {/* Animated Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                      {/* Icon Container */}
                      <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                        {/* Glow effect */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`}></div>
                      </div>
                      
                      {/* Label */}
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-white transition-colors duration-300 line-clamp-2">
                          {item.label}
                        </h3>
                      </div>

                      {/* Arrow Indicator */}
                      <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Loading State - Show overlay when loading modules initially */}
      {isLoadingModules && filteredCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Loader className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Modules...</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Please wait while we load your available modules.
          </p>
        </motion.div>
      )}

      {/* Empty State - Only show when not loading and no modules available after permissions are loaded */}
      {!isLoadingModules && !isLoadingPermissions && filteredCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <LayoutDashboard className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Modules Available</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            You don't have permission to access any modules. Please contact your administrator.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
