import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './store/slices/authSlice';
import { ThemeProvider } from './contexts/ThemeContext';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SliderImagesList from './pages/SliderImages/List';
import SliderImagesForm from './pages/SliderImages/Form';
import CategoriesList from './pages/Categories/List';
import CategoriesForm from './pages/Categories/Form';
import NewsList from './pages/News/List';
import NewsForm from './pages/News/Form';
import MenusList from './pages/Menus/List';
import MenusForm from './pages/Menus/Form';
import PagesList from './pages/Pages/List';
import PagesForm from './pages/Pages/Form';
import PhotoGalleriesList from './pages/PhotoGalleries/List';
import PhotoGalleriesForm from './pages/PhotoGalleries/Form';
import VideoGalleriesList from './pages/VideoGalleries/List';
import VideoGalleriesForm from './pages/VideoGalleries/Form';
import AlbumGalleriesList from './pages/AlbumGalleries/List';
import AlbumGalleriesForm from './pages/AlbumGalleries/Form';
import PopupsList from './pages/Popups/List';
import PopupsForm from './pages/Popups/Form';
import SocialIconsList from './pages/SocialIcons/List';
import SocialIconsForm from './pages/SocialIcons/Form';
import FloatingMenusList from './pages/FloatingMenus/List';
import FloatingMenusForm from './pages/FloatingMenus/Form';
import DailyThoughtsList from './pages/DailyThoughts/List';
import DailyThoughtsForm from './pages/DailyThoughts/Form';
import ModuleBuilderList from './pages/ModuleBuilder/List';
import ModuleBuilderForm from './pages/ModuleBuilder/Form';
import DynamicModuleWrapper from './components/DynamicModule/DynamicModuleWrapper';
import Restore from './pages/Restore';
import RolesList from './pages/Roles/List';
import RolesForm from './pages/Roles/Form';
import UsersList from './pages/Users/List';
import UsersForm from './pages/Users/Form';
import LogsList from './pages/Logs/List';
import ProtectedRoute from './components/ProtectedRoute';
import WebsiteLayout from './website/WebsiteLayout';
import Home from './website/pages/Home';

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchUser());
    }
  }, [token, dispatch]);

  return (
    <Routes>
      {/* Website Routes */}
      <Route path="/" element={<WebsiteLayout />}>
        <Route index element={<Home />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/register" element={<Register />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="slider-images" element={<SliderImagesList />} />
        <Route path="slider-images/create" element={<SliderImagesForm />} />
        <Route path="slider-images/edit/:id" element={<SliderImagesForm />} />
        <Route path="categories" element={<CategoriesList />} />
        <Route path="categories/create" element={<CategoriesForm />} />
        <Route path="categories/edit/:id" element={<CategoriesForm />} />
        <Route path="news" element={<NewsList />} />
        <Route path="news/create" element={<NewsForm />} />
        <Route path="news/edit/:id" element={<NewsForm />} />
        <Route path="menus" element={<MenusList />} />
        <Route path="menus/create" element={<MenusForm />} />
        <Route path="menus/edit/:id" element={<MenusForm />} />
        <Route path="pages" element={<PagesList />} />
        <Route path="pages/create" element={<PagesForm />} />
        <Route path="pages/edit/:id" element={<PagesForm />} />
        <Route path="photo-galleries" element={<PhotoGalleriesList />} />
        <Route path="photo-galleries/create" element={<PhotoGalleriesForm />} />
        <Route path="photo-galleries/edit/:id" element={<PhotoGalleriesForm />} />
        <Route path="video-galleries" element={<VideoGalleriesList />} />
        <Route path="video-galleries/create" element={<VideoGalleriesForm />} />
        <Route path="video-galleries/edit/:id" element={<VideoGalleriesForm />} />
        <Route path="album-galleries" element={<AlbumGalleriesList />} />
        <Route path="album-galleries/create" element={<AlbumGalleriesForm />} />
        <Route path="album-galleries/edit/:id" element={<AlbumGalleriesForm />} />
        <Route path="popups" element={<PopupsList />} />
        <Route path="popups/create" element={<PopupsForm />} />
        <Route path="popups/edit/:id" element={<PopupsForm />} />
        <Route path="social-icons" element={<SocialIconsList />} />
        <Route path="social-icons/create" element={<SocialIconsForm />} />
        <Route path="social-icons/edit/:id" element={<SocialIconsForm />} />
        <Route path="floating-menus" element={<FloatingMenusList />} />
        <Route path="floating-menus/create" element={<FloatingMenusForm />} />
        <Route path="floating-menus/edit/:id" element={<FloatingMenusForm />} />
        <Route path="daily-thoughts" element={<DailyThoughtsList />} />
        <Route path="daily-thoughts/create" element={<DailyThoughtsForm />} />
        <Route path="daily-thoughts/edit/:id" element={<DailyThoughtsForm />} />
        <Route path="module-builder" element={<ModuleBuilderList />} />
        <Route path="module-builder/create" element={<ModuleBuilderForm />} />
        <Route path="module-builder/edit/:id" element={<ModuleBuilderForm />} />
        <Route path="roles" element={<RolesList />} />
        <Route path="roles/create" element={<RolesForm />} />
        <Route path="roles/edit/:id" element={<RolesForm />} />
        <Route path="users" element={<UsersList />} />
        <Route path="users/create" element={<UsersForm />} />
        <Route path="users/edit/:id" element={<UsersForm />} />
        <Route path="logs" element={<LogsList />} />
        <Route path="restore" element={<Restore />} />} />} />} />} />} />} />} />} />} />
{/* Dynamic Module Routes - catch-all for generated modules (must be last) */}
        <Route path=":moduleName" element={<DynamicModuleWrapper type="list" />} />
        <Route path=":moduleName/create" element={<DynamicModuleWrapper type="form" />} />
        <Route path=":moduleName/edit/:id" element={<DynamicModuleWrapper type="form" />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Website Routes - No restrictions */}
      <Route path="/about" element={<WebsiteLayout />}>
        <Route index element={<div className="container mx-auto px-4 py-12"><h1>About Page</h1></div>} />
      </Route>
      <Route path="/academics" element={<WebsiteLayout />}>
        <Route index element={<div className="container mx-auto px-4 py-12"><h1>Academics Page</h1></div>} />
      </Route>
      <Route path="/admissions" element={<WebsiteLayout />}>
        <Route index element={<div className="container mx-auto px-4 py-12"><h1>Admissions Page</h1></div>} />
      </Route>
      <Route path="/news" element={<WebsiteLayout />}>
        <Route index element={<div className="container mx-auto px-4 py-12"><h1>News Page</h1></div>} />
      </Route>
      <Route path="/contact" element={<WebsiteLayout />}>
        <Route index element={<div className="container mx-auto px-4 py-12"><h1>Contact Page</h1></div>} />
      </Route>
      
      {/* Catch all - only redirect to home if not admin route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-text)',
                border: '1px solid var(--toast-border)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                style: {
                  background: '#10b981',
                  color: '#ffffff',
                  border: '1px solid #059669',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                  color: '#ffffff',
                  border: '1px solid #dc2626',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#ef4444',
                },
              },
            }}
          />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

