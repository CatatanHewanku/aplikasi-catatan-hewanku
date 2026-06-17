export const secureFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.clear();
    window.location.href = "/login";
  }

  return response;
};