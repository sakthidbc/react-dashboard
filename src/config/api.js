/**
 * API Configuration
 * Centralized configuration for Laravel backend API
 */

// Base URL for Laravel backend for development
// export const API_BASE_URL = 'http://127.0.0.1:8000';

// Base URL for Laravel backend for production
export const API_BASE_URL = 'https://reactadmin.boscoedusoft.com';

// API endpoint prefix
export const API_PREFIX = '/api';

// Full API URL
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

// Storage URL for images and files
export const STORAGE_URL = `${API_BASE_URL}/storage`;

export default {
  API_BASE_URL,
  API_PREFIX,
  API_URL,
  STORAGE_URL,
};

