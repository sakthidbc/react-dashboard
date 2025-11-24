const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 60 * 1000; // 1 minute in milliseconds
const STORAGE_KEY = 'loginAttempts';
const LOCKOUT_KEY = 'loginLockout';

export const getLoginAttempts = () => {
  try {
    const attempts = localStorage.getItem(STORAGE_KEY);
    return attempts ? JSON.parse(attempts) : { count: 0, timestamp: null };
  } catch {
    return { count: 0, timestamp: null };
  }
};

export const incrementLoginAttempts = () => {
  const attempts = getLoginAttempts();
  const newCount = attempts.count + 1;
  const timestamp = Date.now();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: newCount, timestamp }));
  
  // If max attempts reached, set lockout
  if (newCount >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ locked: true, until: timestamp + LOCKOUT_DURATION }));
  }
  
  return newCount;
};

export const resetLoginAttempts = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
};

export const isLockedOut = () => {
  try {
    const lockout = localStorage.getItem(LOCKOUT_KEY);
    if (!lockout) return false;
    
    const { locked, until } = JSON.parse(lockout);
    if (!locked) return false;
    
    const now = Date.now();
    if (now >= until) {
      // Lockout expired, clear it
      resetLoginAttempts();
      return false;
    }
    
    return { locked: true, until };
  } catch {
    return false;
  }
};

export const getRemainingLockoutTime = () => {
  const lockout = isLockedOut();
  if (!lockout || !lockout.locked) return 0;
  
  const remaining = lockout.until - Date.now();
  return Math.max(0, remaining);
};

export const getRemainingAttempts = () => {
  const attempts = getLoginAttempts();
  return Math.max(0, MAX_ATTEMPTS - attempts.count);
};

