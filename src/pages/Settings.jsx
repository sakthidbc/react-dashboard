import { useState, useEffect } from 'react';
import { Palette, Save } from 'lucide-react';
import { getSettings, updateSettings } from '../services/apiService';
import toast from 'react-hot-toast';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'system',
    sidebarToggle: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await getSettings();
      if (response.data && response.data.settings) {
        const savedSettings = JSON.parse(response.data.settings);
        setSettings(prev => ({ ...prev, ...savedSettings }));
        applySettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Load from localStorage as fallback
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
          applySettings(parsed);
        } catch (e) {
          console.error('Error parsing localStorage settings:', e);
        }
      }
    }
  };

  const applySettings = (settingsToApply) => {
    if (settingsToApply.theme) {
      handleThemeChange(settingsToApply.theme);
    }
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
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

  const handleSidebarToggleChange = (value) => {
    setSettings(prev => ({ ...prev, sidebarToggle: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings({ settings: JSON.stringify(settings) });
      localStorage.setItem('appSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully!');
    } catch (error) {
      // Fallback to localStorage
      localStorage.setItem('appSettings', JSON.stringify(settings));
      toast.success('Settings saved locally!');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
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
          <p className="text-gray-600 dark:text-gray-400">Customize your application preferences</p>
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
                      settings.theme === 'light'
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
                      settings.theme === 'dark'
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
                      settings.theme === 'system'
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
          </SettingSection>


          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
