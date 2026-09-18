import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (username, password) => {
    try {
        const response = await api.post('/login', {
            username: username,
            password: password
        });
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const register = async (username, email, password) => {
    try {
        const response = await api.post('/register', {
            username: username,
            email: email,
            password: password
        });
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getMe = async () => {
    try {
        const response = await api.get('/get-me');
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const logout = async () => {
    try {
        const response = await api.post('/logout');
        return response.data;
    } catch (e) {
        throw e;
    }
};
