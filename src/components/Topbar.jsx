import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Bell, Search, Menu, Settings, UserCircle, Moon, Sun } from 'lucide-react';
import LogoutModal from './LogoutModal';
import { useTheme } from '../contexts/ThemeContext';
import { getImageUrl } from '../services/apiService';

const Topbar = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileImage = () => {
    if (!user?.avatar) return null;
    return getImageUrl(user.avatar_url || user.avatar);
  };

  return (
    <>
      <header className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-20 shadow-sm">
        <div className="px-3 lg:px-4 h-14 flex items-center justify-between">
          {/* Left Section - Menu Toggle & Search */}
          <div className="flex items-center gap-2.5 flex-1">
            <button
              onClick={onMenuClick}
              className="p-1.5 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50/80 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Section - Notifications, Theme Toggle & User Menu */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                {getProfileImage() ? (
                  <img
                    src={getProfileImage()}
                    alt={user?.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200/50 dark:border-gray-600/50"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-md">
                    {getUserInitials(user?.name)}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">{user?.email || ''}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-xl overflow-hidden">
                  {/* User Info Header */}
                  <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                    <div className="flex items-center gap-2.5">
                      {getProfileImage() ? (
                        <img
                          src={getProfileImage()}
                          alt={user?.name || 'User'}
                          className="w-10 h-10 rounded-full object-cover border border-white dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-md">
                          {getUserInitials(user?.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                          {user?.email || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/admin/dashboard/profile');
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2.5"
                    >
                      <UserCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium">My Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/admin/dashboard/settings');
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2.5"
                    >
                      <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium">Settings</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-1.5">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2.5 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
};

export default Topbar;
