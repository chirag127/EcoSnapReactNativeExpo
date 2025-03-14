import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../env";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem("token");
            const storedUser = await AsyncStorage.getItem("user");

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${storedToken}`;
            }
        } catch (error) {
            console.error("Error loading auth info:", error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            const { token: newToken, user: userData } = response.data;

            setToken(newToken);
            setUser(userData);

            await AsyncStorage.setItem("token", newToken);
            await AsyncStorage.setItem("user", JSON.stringify(userData));

            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${newToken}`;

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Login failed",
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                name,
                email,
                password,
            });

            const { token: newToken, user: userData } = response.data;

            setToken(newToken);
            setUser(userData);

            await AsyncStorage.setItem("token", newToken);
            await AsyncStorage.setItem("user", JSON.stringify(userData));

            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${newToken}`;

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Registration failed",
            };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common["Authorization"];
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
