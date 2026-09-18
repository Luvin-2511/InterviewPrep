import {useContext} from 'react'
import {authContext} from "../auth.context.jsx";
import {getMe, login, register, logout} from "../services/auth.api.js";

const useAuth = () => {
    const {user, setUser, loading, setLoading, error, setError} = useContext(authContext)

    const handleLogin = async (username, password) => {
        setLoading(true)
        try {
            const response = await login(username, password)
            setUser(response.user)
            return response
        } catch (e) {
            throw e
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (username, email, password) => {
        setLoading(true)
        try {
            const response = await register(username, email, password)
            setUser(response.user)
            return response
        } catch (e) {
            throw e
        } finally {
            setLoading(false)
        }
    }

    const handleGetMe = async () => {
        setLoading(true)
        try {
            const response = await getMe()
            setUser(response.user)
            return response
        }catch (err){
            throw e
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const response = await logout()
            setUser(null)
            return response
        } catch (e) {
            throw e
        } finally {
            setLoading(false)
        }
    }

    return {user, loading, handleLogin, handleRegister, error, setError, handleGetMe, handleLogout}
}
export default useAuth
