import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Clock, ArrowLeft } from 'lucide-react';
import { isLockedOut, getRemainingLockoutTime } from '../utils/loginAttempts';

const LockoutWarning = ({ onClose }) => {
  const navigate = useNavigate();
  const [lockoutTime, setLockoutTime] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const remaining = getRemainingLockoutTime();
      setLockoutTime(remaining);
      
      if (remaining <= 0) {
        onClose();
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [onClose]);

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const handleGoToLogin = () => {
    navigate('/admin/login');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
            <p className="text-white/90 text-sm">Account is temporarily locked</p>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Your account has been temporarily locked due to multiple failed login attempts. 
                You cannot access the register page or dashboard until the lockout period expires.
              </p>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                  {formatTime(lockoutTime)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Please wait before trying again
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: lockoutTime / 1000, ease: 'linear' }}
                />
              </div>
            </div>

            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This is a security measure to protect accounts from unauthorized access.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleGoToLogin}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Login Page
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LockoutWarning;

