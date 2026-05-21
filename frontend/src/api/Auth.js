import axios from 'axios';
import { api } from "./axiosClient"
import {setAccessToken} from "../api/authToken"

export const login = async ({loginId, password}) => {
    try {
        const res = await api.post(`/auth/login`, { loginId, password });
        setAccessToken(res.data.accessToken)
        return res.data;
    } catch (error) {
        console.error("Failed to log in ", error);
        throw error;
    }
}

export const logout = async () => {
    try {
        const res = await api.post(`/auth/logout`);
        setAccessToken(null)
    } catch (error) {
        console.error("Failed to log out ", error);
        throw error;
    }
}

export const register = async ({username, email, password}) => {
    try {
        const res = await api.post(`/auth/register`, {
            username,
            email,
            password
        });
        return res.data;
    } catch (error) {
        console.error("Failed to register ", error);
        throw error;
    }
}

export const verifyOTP = async ({email, otp}) => {
    try {
        const res = await api.post(`/auth/verify`, {
            email,
            otp
        });
        return res.data;
    } catch (error) {
        console.error("Failed to verify ", error);
        throw error;
    }
}


export const refreshToken = async () => {
    try {
        const res = await api.post(`/auth/refresh`);
        setAccessToken(res.data.accessToken)
        return res.data;
    } catch (error) {
        console.error(" ", error);
        throw error;
    }
}

export const getProfile = async () => { 
    try {
        const res = await api.get(`/auth/me`);
        return res.data;
    } catch (error) {
        console.error(" ", error);
        throw error;
    }
}