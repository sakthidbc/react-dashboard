/**
 * Reusable validation utility with toast notifications
 * Provides consistent validation across all forms
 */

import toast from 'react-hot-toast';

/**
 * Validation rules
 */
export const validationRules = {
  required: (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      toast.error(`${fieldName} is required`);
      return false;
    }
    return true;
  },

  email: (value, fieldName = 'Email') => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error(`Please enter a valid ${fieldName.toLowerCase()}`);
      return false;
    }
    return true;
  },

  minLength: (value, min, fieldName) => {
    if (value && value.length < min) {
      toast.error(`${fieldName} must be at least ${min} characters`);
      return false;
    }
    return true;
  },

  maxLength: (value, max, fieldName) => {
    if (value && value.length > max) {
      toast.error(`${fieldName} must not exceed ${max} characters`);
      return false;
    }
    return true;
  },

  min: (value, min, fieldName) => {
    const numValue = Number(value);
    if (value && !isNaN(numValue) && numValue < min) {
      toast.error(`${fieldName} must be at least ${min}`);
      return false;
    }
    return true;
  },

  max: (value, max, fieldName) => {
    const numValue = Number(value);
    if (value && !isNaN(numValue) && numValue > max) {
      toast.error(`${fieldName} must not exceed ${max}`);
      return false;
    }
    return true;
  },

  pattern: (value, pattern, fieldName, errorMessage) => {
    if (value && !pattern.test(value)) {
      toast.error(errorMessage || `${fieldName} format is invalid`);
      return false;
    }
    return true;
  },

  url: (value, fieldName = 'URL') => {
    if (value) {
      try {
        new URL(value);
      } catch {
        toast.error(`Please enter a valid ${fieldName.toLowerCase()}`);
        return false;
      }
    }
    return true;
  },

  match: (value, matchValue, fieldName) => {
    if (value && value !== matchValue) {
      toast.error(`${fieldName} do not match`);
      return false;
    }
    return true;
  },

  password: (value, fieldName = 'Password') => {
    if (value && value.length < 8) {
      toast.error(`${fieldName} must be at least 8 characters`);
      return false;
    }
    return true;
  },
};

/**
 * Validate a single field
 * @param {*} value - The value to validate
 * @param {Object} rules - Validation rules object
 * @param {string} fieldName - Display name of the field
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateField = (value, rules, fieldName) => {
  if (!rules) return true;

  // Required check
  if (rules.required) {
    if (!validationRules.required(value, fieldName)) {
      return false;
    }
  } else if (!value || (typeof value === 'string' && value.trim() === '')) {
    // If not required and empty, skip other validations
    return true;
  }

  // Email validation
  if (rules.email) {
    if (!validationRules.email(value, fieldName)) {
      return false;
    }
  }

  // URL validation
  if (rules.url) {
    if (!validationRules.url(value, fieldName)) {
      return false;
    }
  }

  // Min length
  if (rules.minLength) {
    if (!validationRules.minLength(value, rules.minLength, fieldName)) {
      return false;
    }
  }

  // Max length
  if (rules.maxLength) {
    if (!validationRules.maxLength(value, rules.maxLength, fieldName)) {
      return false;
    }
  }

  // Min value
  if (rules.min !== undefined) {
    if (!validationRules.min(value, rules.min, fieldName)) {
      return false;
    }
  }

  // Max value
  if (rules.max !== undefined) {
    if (!validationRules.max(value, rules.max, fieldName)) {
      return false;
    }
  }

  // Pattern validation
  if (rules.pattern) {
    const pattern = rules.pattern instanceof RegExp ? rules.pattern : new RegExp(rules.pattern);
    if (!validationRules.pattern(value, pattern, fieldName, rules.patternMessage)) {
      return false;
    }
  }

  // Password validation
  if (rules.password) {
    if (!validationRules.password(value, fieldName)) {
      return false;
    }
  }

  // Match validation
  if (rules.match !== undefined) {
    if (!validationRules.match(value, rules.match, fieldName)) {
      return false;
    }
  }

  return true;
};

/**
 * Validate form data against a schema
 * @param {Object} formData - Form data object
 * @param {Object} schema - Validation schema { fieldName: { rules } }
 * @returns {boolean} - True if all validations pass
 */
export const validateForm = (formData, schema) => {
  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = formData[fieldName];
    const displayName = rules.label || fieldName;
    
    if (!validateField(value, rules, displayName)) {
      return false;
    }
  }
  return true;
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  email: {
    required: true,
    email: true,
  },
  password: {
    required: true,
    password: true,
  },
  url: {
    required: true,
    url: true,
  },
  name: {
    required: true,
    minLength: 2,
  },
  title: {
    required: true,
    minLength: 2,
  },
};

