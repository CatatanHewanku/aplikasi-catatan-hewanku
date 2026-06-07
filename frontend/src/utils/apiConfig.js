/**
 * API configuration for both development and production
 * Automatically uses the correct API URL based on environment
 */

export const getAPIUrl = () => {
  if (import.meta.env.PROD) {
    // In production, use the same origin (works with devtunnel and any domain)
    return window.location.origin;
  } else {
    // In development, use VITE_API_URL or default to localhost
    return import.meta.env.VITE_API_URL || 'http://localhost:8080';
  }
};

export const API_BASE_URL = getAPIUrl();
export const API_ENDPOINT = `${API_BASE_URL}/api`;
