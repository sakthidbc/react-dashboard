import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, X, Menu, Settings, Image, Tag, Newspaper, MenuSquare, RotateCcw, Shield, Users, FileText, Images, Video, Folder, Maximize2, Share2, Navigation, Lightbulb, Code, Package, Activity } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import { useSelector } from 'react-redux';
import { getDynamicModules, moduleToRouteConfig } from '../services/dynamicModuleService';

const Sidebar = ({ isOpen, onToggle, position = 'vertical' }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { hasModuleAccess, hasPermission } = usePermissions();
  const permissions = useSelector((state) => state.auth.permissions) || {};
  const isVertical = position === 'vertical';

  const [dynamicModules, setDynamicModules] = useState([]);

  useEffect(() => {
    loadDynamicModules();
  }, []);

  const loadDynamicModules = async () => {
    try {
      // Load modules in background, don't block sidebar rendering
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
          module: config.name,
          action: 'read',
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
    }
  };

  const menuCategories = useMemo(() => {
    // Base static items
    const baseContentItems = [
      { icon: Image, label: 'Slider Images', path: '/admin/dashboard/slider-images', module: 'slider_images', action: 'read' },
      { icon: Tag, label: 'Categories', path: '/admin/dashboard/categories', module: 'categories', action: 'read' },
      { icon: Newspaper, label: 'News', path: '/admin/dashboard/news', module: 'news', action: 'read' },
      { icon: MenuSquare, label: 'Menus', path: '/admin/dashboard/menus', module: 'menus', action: 'read' },
      { icon: FileText, label: 'Pages', path: '/admin/dashboard/pages', module: 'pages', action: 'read' },
      { icon: Images, label: 'Photo Galleries', path: '/admin/dashboard/photo-galleries', module: 'photo_galleries', action: 'read' },
      { icon: Video, label: 'Video Galleries', path: '/admin/dashboard/video-galleries', module: 'video_galleries', action: 'read' },
      { icon: Folder, label: 'Album Galleries', path: '/admin/dashboard/album-galleries', module: 'album_galleries', action: 'read' },
      { icon: Maximize2, label: 'Popups', path: '/admin/dashboard/popups', module: 'popups', action: 'read' },
      { icon: Share2, label: 'Social Icons', path: '/admin/dashboard/social-icons', module: 'social_icons', action: 'read' },
      { icon: Navigation, label: 'Floating Menus', path: '/admin/dashboard/floating-menus', module: 'floating_menus', action: 'read' },
      { icon: Lightbulb, label: 'Daily Thoughts', path: '/admin/dashboard/daily-thoughts', module: 'daily_thoughts', action: 'read' },
    ];
    
    // Create a Set of existing paths to check for duplicates
    const existingPaths = new Set(baseContentItems.map(item => item.path));
    
    // Filter out duplicates from dynamic modules
    const uniqueDynamicModules = dynamicModules.filter(module => !existingPaths.has(module.path));
    
    return [
      {
        title: 'Main',
        items: [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', module: null },
        ],
      },
      {
        title: 'Content Management',
        items: [
          ...baseContentItems,
          ...uniqueDynamicModules,
        ],
      },
    {
      title: 'User Management',
      items: [
        { icon: Users, label: 'Users', path: '/admin/dashboard/users', module: 'roles', action: 'read' },
        { icon: Shield, label: 'Roles & Permissions', path: '/admin/dashboard/roles', module: 'roles', action: 'read' },
      ],
    },
    {
      title: 'System',
      items: [
        { icon: Code, label: 'Module Builder', path: '/admin/dashboard/module-builder', module: 'module_builder', action: 'read' },
        { icon: Activity, label: 'Logs', path: '/admin/dashboard/logs', module: 'logs', action: 'read' },
        { icon: RotateCcw, label: 'Restore', path: '/admin/dashboard/restore', module: 'restore', action: 'read' },
        { icon: Settings, label: 'Settings', path: '/admin/dashboard/settings', module: null },
      ],
    },
  ];
  }, [dynamicModules]);

  // Filter menu items based on permissions - memoized for performance
  const filteredCategories = useMemo(() => {
    return menuCategories.map(category => ({
      ...category,
      items: category.items.filter(item => {
        // Always show items without module requirement (like Dashboard, Settings)
        if (!item.module) return true;
        // Check if user has read/view permission for the module
        return hasPermission(item.module, item.action || 'read');
      }),
    })).filter(category => category.items.length > 0); // Only show categories that have visible items
  }, [menuCategories, permissions]);

  // Flatten all menu items for horizontal layout - memoized
  const allMenuItems = useMemo(() => {
    return filteredCategories.flatMap(category => category.items);
  }, [filteredCategories]);

  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="h-14 px-4 flex items-center border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 flex-shrink-0">
        <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">Dashboard</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-4 custom-scrollbar">
        {filteredCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-1">
            {category.title && (
              <div className="px-3 py-1.5">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {category.title}
                </h3>
              </div>
            )}
            {category.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/30'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : ''}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      
      <div className="p-2 border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-200"
        >
          {isDark ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium">Light Mode</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="text-sm font-medium">Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      {isVertical ? (
        <aside className={`hidden lg:flex w-56 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 flex-col h-screen fixed left-0 top-0 shadow-xl transition-transform duration-300 z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </aside>
      ) : (
        <aside className={`hidden lg:flex ${isOpen ? 'h-14' : 'h-0'} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 w-full transition-all duration-300 z-30 overflow-hidden`}>
          {isOpen && (
            <div className="w-full h-14 flex items-center px-3 overflow-x-auto custom-scrollbar-horizontal">
              <div className="flex items-center gap-1 flex-1 min-w-max">
                {allMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                        active
                          ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/30'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-200 flex-shrink-0"
              >
                {isDark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 z-50 shadow-2xl">
            <div className="h-14 px-3 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 flex-shrink-0">
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">Menu</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-900 dark:text-white" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
