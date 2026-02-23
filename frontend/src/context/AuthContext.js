import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('fms_token'));
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Set default axios header if token exists
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    // Check Local Storage and Load User
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get('http://localhost:5000/api/auth/me');
                setUser(res.data);
                setIsAuthenticated(true);
            } catch (err) {
                console.error("Auth Load Error:", err.response?.data?.msg || err.message);
                localStorage.removeItem('fms_token');
                setToken(null);
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });

            const { token: tkn, user: usr } = res.data;
            localStorage.setItem('fms_token', tkn);
            setToken(tkn);
            setUser(usr);
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });

            const { token: tkn, user: usr } = res.data;
            localStorage.setItem('fms_token', tkn);
            setToken(tkn);
            setUser(usr);
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('fms_token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            token,
            user,
            isAuthenticated,
            loading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
