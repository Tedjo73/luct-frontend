// src/api.js
const API_URL = 'http://localhost:5000/api';

// Helper function to get token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============== AUTH APIs ==============

export const register = async (userData) => {
  return apiCall('/auth/register', 'POST', userData);
};

export const login = async (credentials) => {
  const data = await apiCall('/auth/login', 'POST', credentials);
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ============== REPORT APIs ==============

export const getReports = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/reports${queryString ? '?' + queryString : ''}`);
};

export const getReport = async (id) => {
  return apiCall(`/reports/${id}`);
};

export const createReport = async (reportData) => {
  return apiCall('/reports', 'POST', reportData);
};

export const updateReport = async (id, reportData) => {
  return apiCall(`/reports/${id}`, 'PUT', reportData);
};

export const deleteReport = async (id) => {
  return apiCall(`/reports/${id}`, 'DELETE');
};

export const addFeedback = async (id, feedbackData) => {
  return apiCall(`/reports/${id}/feedback`, 'POST', feedbackData);
};

export const exportToExcel = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/reports/export/excel`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Export failed');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reports_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// ============== CLASS APIs ==============

export const getClasses = async () => {
  return apiCall('/classes');
};

export const getClass = async (id) => {
  return apiCall(`/classes/${id}`);
};

// ============== RATING APIs ==============

export const submitRating = async (ratingData) => {
  return apiCall('/ratings', 'POST', ratingData);
};

export const getRatings = async () => {
  return apiCall('/ratings');
};

export const getReportRatings = async (reportId) => {
  return apiCall(`/ratings/${reportId}`);
};

export const getAverageRating = async (reportId) => {
  return apiCall(`/ratings/${reportId}/average`);
};

// ============== MONITORING APIs ==============

export const getActivities = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/monitoring/activities${queryString ? '?' + queryString : ''}`);
};

export const getMonitoringStats = async () => {
  return apiCall('/monitoring/stats');
};

// ============== DASHBOARD APIs ==============

export const getDashboardStats = async () => {
  return apiCall('/dashboard/stats');
};

export const checkHealth = async () => {
  return apiCall('/health');
};