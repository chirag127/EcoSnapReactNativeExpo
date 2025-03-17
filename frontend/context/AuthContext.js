import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../env";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingVerification, setPendingVerification] = useState(false);

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

            // User is verified, proceed with login
            setToken(newToken);
            setUser(userData);

            await AsyncStorage.setItem("token", newToken);
            await AsyncStorage.setItem("user", JSON.stringify(userData));

            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${newToken}`;

            return { success: true };
        } catch (error) {
            // Check if this is a verification error
            if (
                error.response?.status === 403 &&
                error.response?.data?.needsVerification
            ) {
                // Set user data for verification screen
                setUser(error.response.data.user);
                setPendingVerification(true);
                return {
                    success: false,
                    needsVerification: true,
                    error: "Please verify your email to continue",
                };
            }

            return {
                success: false,
                error: error.response?.data?.error || "Login failed",
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            console.log(`Attempting to register user: ${email}`);
            const response = await axios.post(`${API_URL}/auth/register`, {
                name,
                email,
                password,
            });

            console.log("Registration response:", response.data);
            const { token: newToken, user: userData, message } = response.data;

            setToken(newToken);
            setUser(userData);

            await AsyncStorage.setItem("token", newToken);
            await AsyncStorage.setItem("user", JSON.stringify(userData));

            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${newToken}`;

            // Check if user needs verification
            if (userData && !userData.isVerified) {
                setPendingVerification(true);
            }

            return {
                success: true,
                message,
                needsVerification: !userData.isVerified,
            };
        } catch (error) {
            console.error("Registration error:", error);
            console.error("Error response:", error.response?.data);
            return {
                success: false,
                error: error.response?.data?.error || "Registration failed",
                details: error.response?.data?.details || error.message,
            };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            setToken(null);
            setUser(null);
            setPendingVerification(false);
            delete axios.defaults.headers.common["Authorization"];
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const verifyEmail = async (email, verificationCode) => {
        try {
            const response = await axios.post(`${API_URL}/auth/verify-email`, {
                email,
                verificationCode,
            });

            const { token: newToken, user: userData, message } = response.data;

            setToken(newToken);
            setUser(userData);
            setPendingVerification(false);

            await AsyncStorage.setItem("token", newToken);
            await AsyncStorage.setItem("user", JSON.stringify(userData));

            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${newToken}`;

            return { success: true, message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Verification failed",
            };
        }
    };

    const resendVerificationCode = async (email) => {
        try {
            const response = await axios.post(
                `${API_URL}/auth/resend-verification`,
                {
                    email,
                }
            );

            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    "Failed to resend verification code",
            };
        }
    };

    // Function to reset verification state
    const resetVerificationState = () => {
        setPendingVerification(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                pendingVerification,
                login,
                register,
                logout,
                verifyEmail,
                resendVerificationCode,
                resetVerificationState,
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
