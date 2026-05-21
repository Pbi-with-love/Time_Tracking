import React, { createContext, useState, useEffect } from "react"
import * as authApi from "../api/Auth"
import { api } from "../api/axiosClient"
import { Settings } from "lucide-react"

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                await authApi.refreshToken();
                const userData = await authApi.getProfile();
                setUser(userData);
            } catch (error) {
                setUser(null);
                console.error("Error to initial authenticate user ", error);
            } finally {
                setLoading(false);
            }
        }
        initAuth();
    }, [])

    const login = async (loginId, password) => {
        const res = await authApi.login({loginId, password});
        setUser(res.user);
    }
    
    const logout = async () => {
        await authApi.logout();
        setUser(null)
    }

    const value = {
        user,
        setUser,
        login,
        logout,
        loading
    }


    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-4 text-foreground">
                        <div className="rounded-full border border-border bg-card p-5 shadow-sm">
                            <Settings className="h-12 w-12 animate-spin text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;
