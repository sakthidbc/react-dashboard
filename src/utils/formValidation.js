import toast from 'react-hot-toast';

/**
 * Validate form fields and show toast errors
 * @param {Object} fields - Object with field names as keys and validation rules as values
 * @param {Object} values - Form values object
 * @returns {boolean} - Returns true if validation passes, false otherwise
 */
export const validateForm = (fields, values) => {
  const errors = {};

  for (const [fieldName, rules] of Object.entries(fields)) {
    const value = values[fieldName];
    const fieldLabel = rules.label || fieldName;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[fieldName] = `${fieldLabel} is required`;
      toast.error(`${fieldLabel} is required`);
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      continue;
    }

    // Email validation
    if (rules.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[fieldName] = `${fieldLabel} must be a valid email address`;
        toast.error(`${fieldLabel} must be a valid email address`);
        continue;
      }
    }

    // URL validation
    if (rules.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        errors[fieldName] = `${fieldLabel} must be a valid URL`;
        toast.error(`${fieldLabel} must be a valid URL`);
        continue;
      }
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors[fieldName] = `${fieldLabel} must be at least ${rules.minLength} characters`;
      toast.error(`${fieldLabel} must be at least ${rules.minLength} characters`);
      continue;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[fieldName] = `${fieldLabel} must not exceed ${rules.maxLength} characters`;
      toast.error(`${fieldLabel} must not exceed ${rules.maxLength} characters`);
      continue;
    }

    // Min value validation (for numbers)
    if (rules.min !== undefined && Number(value) < rules.min) {
      errors[fieldName] = `${fieldLabel} must be at least ${rules.min}`;
      toast.error(`${fieldLabel} must be at least ${rules.min}`);
      continue;
    }

    // Max value validation (for numbers)
    if (rules.max !== undefined && Number(value) > rules.max) {
      errors[fieldName] = `${fieldLabel} must not exceed ${rules.max}`;
      toast.error(`${fieldLabel} must not exceed ${rules.max}`);
      continue;
    }

    // Custom validation function
    if (rules.validate && typeof rules.validate === 'function') {
      const customError = rules.validate(value, values);
      if (customError) {
        errors[fieldName] = customError;
        toast.error(customError);
        continue;
      }
    }
  }

  return Object.keys(errors).length === 0;
};

/**
 * Validate a single field
 * @param {string} fieldName - Name of the field
 * @param {*} value - Value to validate
 * @param {Object} rules - Validation rules
 * @returns {string|null} - Error message or null if valid
 */
export const validateField = (fieldName, value, rules) => {
  const fieldLabel = rules.label || fieldName;

  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${fieldLabel} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  // Email validation
  if (rules.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldLabel} must be a valid email address`;
    }
  }

  // URL validation
  if (rules.type === 'url' && value) {
    try {
      new URL(value);
    } catch {
      return `${fieldLabel} must be a valid URL`;
    }
  }

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    return `${fieldLabel} must be at least ${rules.minLength} characters`;
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return `${fieldLabel} must not exceed ${rules.maxLength} characters`;
  }

  // Min value validation
  if (rules.min !== undefined && Number(value) < rules.min) {
    return `${fieldLabel} must be at least ${rules.min}`;
  }

  // Max value validation
  if (rules.max !== undefined && Number(value) > rules.max) {
    return `${fieldLabel} must not exceed ${rules.max}`;
  }

  // Custom validation
  if (rules.validate && typeof rules.validate === 'function') {
    return rules.validate(value) || null;
  }

  return null;
};

