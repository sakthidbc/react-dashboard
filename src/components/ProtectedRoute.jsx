import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLockedOut } from '../utils/loginAttempts';
import LockoutWarning from './LockoutWarning';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showLockoutWarning, setShowLockoutWarning] = useState(false);
  const navigate = useNavigate();

  // Check for lockout on mount
  useEffect(() => {
    const checkLockout = () => {
      const lockout = isLockedOut();
      if (lockout && lockout.locked) {
        setShowLockoutWarning(true);
        toast.error('Account is locked. Please wait before accessing the dashboard.');
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if locked out
  const lockout = isLockedOut();
  if (lockout && lockout.locked) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Access restricted...</p>
          </div>
        </div>
        {showLockoutWarning && (
          <LockoutWarning onClose={() => {
            setShowLockoutWarning(false);
            navigate('/admin/login');
          }} />
        )}
      </>
    );
  }

  return children;
};

export default ProtectedRoute;

