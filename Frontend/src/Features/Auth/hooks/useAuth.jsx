import { useContext } from 'react';
import { authContext } from "../auth.context.jsx";
import { getMe, login, register, logout } from "../services/auth.api.js";

const useAuth = () => {
    const { user, setUser, loading, setLoading, error, setError } = useContext(authContext);

    const handleLogin = async (username, password) => {
        setLoading(true);
        try {
            const response = await login(username, password);
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            setUser(response.user);
            return response;
        } catch (e) {
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (username, email, password) => {
        setLoading(true);
        try {
            const response = await register(username, email, password);
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            setUser(response.user);
            return response;
        } catch (e) {
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const handleGetMe = async () => {
        setLoading(true);
        try {
            // 1. Check if redirected from Google OAuth with ?token=... in URL
            if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                const urlToken = urlParams.get('token');
                if (urlToken) {
                    localStorage.setItem('token', urlToken);
                    urlParams.delete('token');
                    const newQuery = urlParams.toString() ? `?${urlParams.toString()}` : '';
                    window.history.replaceState({}, document.title, window.location.pathname + newQuery);
                }
            }

            const response = await getMe();
            setUser(response.user);
            return response;
        } catch (err) {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            const response = await logout();
            localStorage.removeItem('token');
            setUser(null);
            return response;
        } catch (e) {
            localStorage.removeItem('token');
            setUser(null);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, handleLogin, handleRegister, error, setError, handleGetMe, handleLogout };
};

export default useAuth;
