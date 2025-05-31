import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Add request interceptor
api.interceptors.request.use(request => {
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Starting Request', request);
  return request;
});

// Add request interceptor to include token
api.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Add response interceptor
api.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
}, error => {
  console.log('Error Response:', error.response);
  return Promise.reject(error);
});

export default api;