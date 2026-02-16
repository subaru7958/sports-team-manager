import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    withCredentials: true
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle session expiration
        if (error.response?.status === 401) {
            console.error('Unauthorized - session may have expired');
        }
        return Promise.reject(error);
    }
);

export default api;
