import axios from 'axios';

const API_URL = import.meta.env.PROD
  ? window.location.origin
  : (import.meta.env.VITE_API_URL || 'http://localhost:4000');

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function generateDeviceId() {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const authService = {
  login: async (identifier, password) => {
    try {
      const device_id = localStorage.getItem('device_id') || generateDeviceId();
      localStorage.setItem('device_id', device_id);

      const response = await api.post('/auth/login', {
        identifier,
        password,
        device_id,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('owner', JSON.stringify(response.data.owner));
        localStorage.setItem('isLogin', 'true');
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  signup: async (firstName, email, phone, password) => {
    try {
      const device_id = localStorage.getItem('device_id') || generateDeviceId();
      localStorage.setItem('device_id', device_id);

      const response = await api.post('/owners', {
        owner_name: firstName,
        owner_email: email,
        owner_phone_number: phone,
        password: password,
        device_id: device_id,
      });

      if (response.status === 201 && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('owner', JSON.stringify(response.data.owner));
        localStorage.setItem('isLogin', 'true');
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const device_id = localStorage.getItem('device_id');
      await api.post('/auth/logout', { device_id });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('owner');
      localStorage.removeItem('isLogin');
      localStorage.removeItem('pets');
    }
  },

  forgotPassword: async (identifier) => {
    try {
      const response = await api.post('/auth/forgot-password', {
        identifier: identifier,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyCode: async (identifier, code) => {
    try {
      let ownerResponse;
      
      try {
        ownerResponse = await api.get(`/owners/email/${identifier}`);
      } catch (error) {
        ownerResponse = await api.get(`/owners/phone/${identifier}`);
      }
      
      const owner_id = ownerResponse.data.data?.owner_id;
      if (!owner_id) {
        throw { message: "User not found" };
      }
      
      const response = await api.post('/auth/verify-code', {
        owner_id: owner_id,
        verification_code: code,
      });
      
      localStorage.setItem("resetCode", code);
      localStorage.setItem("resetOwnerId", owner_id);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resetPassword: async (identifier, code, newPassword) => {
    try {
      let ownerResponse;
      try {
        ownerResponse = await api.get(`/owners/email/${identifier}`);
      } catch (error) {
        ownerResponse = await api.get(`/owners/phone/${identifier}`);
      }
      
      const owner_id = ownerResponse.data.data?.owner_id;
      if (!owner_id) {
        throw { message: "User not found" };
      }
      
      const response = await api.post('/auth/reset-password', {
        owner_id: owner_id,
        code: code,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;