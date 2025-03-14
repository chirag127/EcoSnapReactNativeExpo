import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace 192.168.1.X with your actual local IP address
// export const API_URL = "http://192.168.31.232:4000/api";
// export const API_URL = "http://localhost:4000/api";
export const API_URL = "https://ecosnapreactnativeexpo.onrender.com/api";

// Set up axios defaults for authentication
axios.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
