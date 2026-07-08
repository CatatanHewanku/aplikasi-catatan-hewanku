export const getAPIUrl = () => {
  if (import.meta.env.PROD) {
    return window.location.origin;
  } else {
    return import.meta.env.VITE_API_URL || 'http://localhost:4000';
  }
};

export const API_BASE_URL = getAPIUrl();
export const API_ENDPOINT = `${API_BASE_URL}/api`;
