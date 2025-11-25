import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Palette, Save, Users, Ban, CheckCircle, Loader } from 'lucide-react';
import { getSettings, updateUserSettings, getSettingsUsers, toggleUserBlock } from '../services/apiService';
import { usePermissions } from '../hooks/usePermissions';
import Can from '../components/Can';
import toast from 'react-hot-toast';

const Settings = () => {
  const { hasPermission } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [userSettings, setUserSettings] = useState({
    theme: localStorage.getItem('theme') || 'system',
    sidebarToggle: true,
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadSettings();
    loadUsers();
  }, []);

  // Check if user has read permission for settings (after all hooks)
  if (!hasPermission('settings', 'read')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const loadSettings = async () => {
    try {
      const response = await getSettings();
      if (response.data) {
        // Load user settings
        if (response.data.user_settings) {
          const savedSettings = JSON.parse(response.data.user_settings);
          setUserSettings(prev => ({ ...prev, ...savedSettings }));
          applySettings(savedSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Load from localStorage as fallback
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setUserSettings(prev => ({ ...prev, ...parsed }));
          applySettings(parsed);
        } catch (e) {
          console.error('Error parsing localStorage settings:', e);
        }
      }
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await getSettingsUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const applySettings = (settingsToApply) => {
    if (settingsToApply.theme) {
      handleThemeChange(settingsToApply.theme);
    }
  };

  const handleThemeChange = (theme) => {
    setUserSettings(prev => ({ ...prev, theme }));
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.removeItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSaveUserSettings = async () => {
    setIsLoading(true);
    try {
      await updateUserSettings({ settings: JSON.stringify(userSettings) });
      localStorage.setItem('appSettings', JSON.stringify(userSettings));
      toast.success('User settings saved successfully!');
    } catch (error) {
      localStorage.setItem('appSettings', JSON.stringify(userSettings));
      toast.success('Settings saved locally!');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserBlock = async (userId) => {
    try {
      setTogglingUserId(userId);
      const response = await toggleUserBlock(userId);
      if (response.data) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, is_blocked: response.data.user.is_blocked }
            : user
        ));
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Error toggling user block:', error);
    } finally {
      setTogglingUserId(null);
    }
  };

  const SettingSection = ({ icon: Icon, title, description, children }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-4 lg:p-6 xl:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Customize your application preferences and system settings</p>
        </div>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <SettingSection
            icon={Palette}
            title="Appearance"
            description="Customize the look and feel of your application"
          >
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      userSettings.theme === 'light'
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <svg className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Light</p>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      userSettings.theme === 'dark'
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <svg className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Dark</p>
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      userSettings.theme === 'system'
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <svg className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">System</p>
                  </button>
                </div>
              </div>
            </div>
            <Can module="settings" action="update">
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSaveUserSettings}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Appearance Settings
                    </>
                  )}
                </button>
              </div>
            </Can>
          </SettingSection>

          {/* User Management */}
          <Can module="settings" action="read">
            <SettingSection
              icon={Users}
              title="User Management"
              description="Block or unblock users to prevent or allow login access"
            >
            <div className="space-y-3">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No users found
                </p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {user.is_blocked ? (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          Blocked
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                      <Can module="settings" action="update">
                        <button
                          onClick={() => handleToggleUserBlock(user.id)}
                          disabled={togglingUserId === user.id}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.is_blocked
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {togglingUserId === user.id ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              {user.is_blocked ? 'Unblocking...' : 'Blocking...'}
                            </>
                          ) : (
                            user.is_blocked ? 'Unblock' : 'Block'
                          )}
                        </button>
                      </Can>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SettingSection>
          </Can>
        </div>
      </div>
    </div>
  );
};

export default Settings;
