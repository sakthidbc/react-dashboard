import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout (55 minutes)

const useSessionTimeout = (onWarning) => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (!isAuthenticated || !token) {
      return;
    }

    // Reset warning flag when timer resets
    warningShownRef.current = false;

    // Set timeout for warning (55 minutes from now)
    warningTimeoutRef.current = setTimeout(() => {
      warningShownRef.current = true;
      if (onWarning) {
        onWarning(WARNING_TIME);
      }
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set timeout for actual logout (1 hour from now)
    timeoutRef.current = setTimeout(() => {
      dispatch(logout());
      window.location.href = '/admin/login';
    }, SESSION_TIMEOUT);
  }, [isAuthenticated, token, dispatch, onWarning]);

  const handleActivity = useCallback(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Update last activity time
    lastActivityRef.current = Date.now();
    
    // Reset timers (this extends the session)
    resetTimer();
  }, [isAuthenticated, token, resetTimer]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Clear timers if not authenticated
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      warningShownRef.current = false;
      return;
    }

    // Set last activity time when authenticated
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    // Initialize timer
    resetTimer();

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Also track visibility change (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isAuthenticated, token, handleActivity, resetTimer]);

  const resetSession = useCallback(() => {
    if (!isAuthenticated || !token) {
      return;
    }
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    resetTimer();
  }, [isAuthenticated, token, resetTimer]);

  return {
    resetTimer: handleActivity,
    resetSession,
  };
};

export default useSessionTimeout;

