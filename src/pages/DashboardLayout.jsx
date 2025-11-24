import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, fetchPermissions } from '../store/slices/authSlice';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, token, permissions } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarPosition, setSidebarPosition] = useState(() => {
    return localStorage.getItem('sidebarPosition') || 'vertical';
  });

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Always fetch user data to ensure permissions are loaded
    // This ensures permissions are available when Dashboard renders
    if (token && (!isAuthenticated || !permissions || Object.keys(permissions).length === 0)) {
      dispatch(fetchUser());
    }
  }, [token, isAuthenticated, permissions, dispatch, navigate]);

  useEffect(() => {
    const handleSidebarPositionChange = (event) => {
      const newPosition = event.detail || event.newValue || localStorage.getItem('sidebarPosition') || 'vertical';
      setSidebarPosition(newPosition);
    };

    // Listen for custom event
    window.addEventListener('sidebarPositionChanged', handleSidebarPositionChange);
    // Also listen for storage events (in case changed in another tab)
    window.addEventListener('storage', handleSidebarPositionChange);
    
    // Check localStorage on mount
    const savedPosition = localStorage.getItem('sidebarPosition');
    if (savedPosition) {
      setSidebarPosition(savedPosition);
    }

    return () => {
      window.removeEventListener('sidebarPositionChanged', handleSidebarPositionChange);
      window.removeEventListener('storage', handleSidebarPositionChange);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isVertical = sidebarPosition === 'vertical';

  return (
    <div className="min-h-screen transition-colors">
      {isVertical ? (
        <>
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} position="vertical" />
          <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-56' : 'lg:ml-0'}`}>
            <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="min-h-[calc(100vh-56px)]">
              <Outlet />
            </main>
          </div>
        </>
      ) : (
        <div className="flex flex-col h-screen">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} position="horizontal" />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

