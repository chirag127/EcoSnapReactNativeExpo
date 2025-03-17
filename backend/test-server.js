import axios from "axios";

// Replace with your actual server URL
const API_URL = "http://192.168.31.232:4000/api";

async function testServer() {
    try {
        console.log("Testing server connection...");
        const response = await axios.get(`${API_URL}/auth/test`);
        console.log("Server response:", response.data);
        console.log("Server is running correctly!");
    } catch (error) {
        console.error("Error connecting to server:", error.message);
        if (error.response) {
            console.error("Server response:", error.response.data);
        } else if (error.request) {
            console.error(
                "No response received from server. Server might be down or unreachable."
            );
        }
    }
}

testServer();
