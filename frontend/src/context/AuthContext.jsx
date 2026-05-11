import React, { createContext, useState, useEffect } from "react"
import * as authApi from "../api/Auth"
import { api } from "../api/axiosClient"

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                await authApi.refreshToken();
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
                console.error("Error to initial authenticate user ", error);
                throw error;
            } finally {
                setLoading(false);
            }
        }
        initAuth();
    }, [])

    const login = async (loginId, password) => {
        await authApi.login({loginId, password});
        setIsAuthenticated(true);
    }
    
    const logout = async () => {
        await authApi.logout();
        setIsAuthenticated(false);
    }

    const value = {
        isAuthenticated,
        login,
        logout,
        loading
    }


    return (
        <AuthContext.Provider value={value}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;