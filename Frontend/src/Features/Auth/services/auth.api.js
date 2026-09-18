import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/auth',
    withCredentials: true
})


export const login = async (username, password) => {
    try {
        const response = await api.post('/login', {
            username: username,
            password: password
        })
        return response.data
    } catch (e) {
        throw e
    }
}

export const register = async (username, email, password) => {
    try {
        const response = await api.post('/register', {
            username: username,
            email: email,
            password: password
        })
        return response.data
    } catch (e) {
        throw e
    }
}

export const getMe = async () => {
    try {
        const response = await api.get('/get-me')
        return response.data
    }catch (e) {
        throw e
    }
}

export const logout = async () => {
    try {
        const response = await api.post('/logout')
        return response.data
    } catch (e) {
        throw e
    }
}