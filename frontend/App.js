import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "./context/AuthContext";

import ScannerScreen from "./screens/ScannerScreen";
import HistoryScreen from "./screens/HistoryScreen";
import PromptsScreen from "./screens/PromptsScreen";
import AuthScreen from "./screens/AuthScreen";
import AdminScreen from "./screens/AdminScreen";

const Tab = createBottomTabNavigator();

function AppContent() {
    const { user, loading, logout, pendingVerification } = useAuth();

    if (loading) {
        return null; // Or a loading spinner
    }

    if (!user || pendingVerification || (user && !user.isVerified)) {
        return <AuthScreen />;
    }

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === "Scanner") {
                        iconName = focused ? "camera" : "camera-outline";
                    } else if (route.name === "History") {
                        iconName = focused ? "time" : "time-outline";
                    } else if (route.name === "Prompts") {
                        iconName = focused ? "list" : "list-outline";
                    } else if (route.name === "Admin") {
                        iconName = focused ? "shield" : "shield-outline";
                    }
                    return (
                        <Ionicons name={iconName} size={size} color={color} />
                    );
                },
                headerRight: () => (
                    <TouchableOpacity
                        onPress={logout}
                        style={{ marginRight: 15 }}
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={24}
                            color="#4CAF50"
                        />
                    </TouchableOpacity>
                ),
            })}
        >
            <Tab.Screen name="Scanner" component={ScannerScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Prompts" component={PromptsScreen} />
            {user.isAdmin && (
                <Tab.Screen name="Admin" component={AdminScreen} />
            )}
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppContent />
            </NavigationContainer>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});
