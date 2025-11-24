import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { X, Clock, AlertTriangle, LogOut } from 'lucide-react';

const SessionTimeoutModal = ({ isOpen, onClose, remainingTime, onExtend }) => {
  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState(remainingTime);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(remainingTime);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1000);
        if (newTime === 0) {
          clearInterval(interval);
          handleLogout();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, remainingTime]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      window.location.href = '/admin/login';
    } catch (error) {
      // Even if logout fails, redirect to login
      window.location.href = '/admin/login';
    }
  };

  const handleExtend = () => {
    if (onExtend) {
      onExtend();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all animate-scaleIn border border-gray-200 dark:border-gray-700">
        {/* Close button */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Session Timeout Warning
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your session is about to expire
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Time Remaining
              </span>
            </div>
            <div className="text-4xl font-bold text-amber-700 dark:text-amber-300 font-mono tracking-wider">
              {formatTime(timeLeft)}
            </div>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-2">
              Your session will expire in {formatTime(timeLeft)}. Please extend your session to continue working.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              For security reasons, your session will automatically expire after 1 hour of inactivity. 
              Click <strong className="text-gray-900 dark:text-white">"Extend Session"</strong> to continue working, 
              or <strong className="text-gray-900 dark:text-white">"Logout Now"</strong> to end your session immediately.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-6 mb-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 ease-linear"
                style={{
                  width: `${(timeLeft / remainingTime) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Logging out...' : 'Logout Now'}
          </button>
          <button
            onClick={handleExtend}
            disabled={isLoggingOut}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Extend Session
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SessionTimeoutModal;

