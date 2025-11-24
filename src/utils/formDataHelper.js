/**
 * Helper function to safely check if data is FormData
 * This prevents "Right-hand side of 'instanceof' is not callable" errors
 * Uses constructor name check instead of instanceof for better compatibility
 */
export const isFormData = (data) => {
  if (!data) return false;
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return false;
  
  // Check if FormData exists and is a constructor function
  if (typeof window.FormData === 'undefined') return false;
  if (typeof window.FormData !== 'function') return false;
  
  // Method 1: Check constructor name (most reliable, avoids instanceof)
  if (data.constructor && data.constructor.name === 'FormData') {
    return true;
  }
  
  // Method 2: Try instanceof with try-catch as fallback
  try {
    if (data instanceof window.FormData) {
      return true;
    }
  } catch (e) {
    // instanceof failed, continue to method 3
  }
  
  // Method 3: Check if it has FormData-like methods (final fallback)
  return (
    typeof data.append === 'function' &&
    typeof data.get === 'function' &&
    typeof data.has === 'function' &&
    typeof data.set === 'function'
  );
};

