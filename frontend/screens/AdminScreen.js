import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Modal,
    Image,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "../env";
import { useAuth } from "../context/AuthContext";
import Markdown from "react-native-markdown-display";

export default function AdminScreen() {
    const [activeTab, setActiveTab] = useState("history");
    const [allHistory, setAllHistory] = useState([]);
    const [allPrompts, setAllPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { logout } = useAuth();

    const handleAuthError = () => {
        Alert.alert("Session Expired", "Please log in again", [
            { text: "OK", onPress: () => logout() },
        ]);
    };

    const fetchAllHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/admin/all-history`);
            setAllHistory(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                handleAuthError();
            } else if (error.response?.status === 403) {
                Alert.alert("Access Denied", "You don't have admin privileges");
            } else {
                Alert.alert("Error", "Failed to fetch history data");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAllPrompts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/prompts/admin/all-prompts`);
            setAllPrompts(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                handleAuthError();
            } else if (error.response?.status === 403) {
                Alert.alert("Access Denied", "You don't have admin privileges");
            } else {
                Alert.alert("Error", "Failed to fetch prompts data");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "history") {
            fetchAllHistory();
        } else {
            fetchAllPrompts();
        }
    }, [activeTab]);

    const onRefresh = async () => {
        setRefreshing(true);
        if (activeTab === "history") {
            await fetchAllHistory();
        } else {
            await fetchAllPrompts();
        }
        setRefreshing(false);
    };

    const getWasteColor = (response) => {
        const text = response.toLowerCase();
        if (text.includes("recyclable")) return "#4CAF50";
        if (text.includes("compostable")) return "#FF9800";
        if (text.includes("landfill")) return "#F44336";
        return "#757575";
    };

    const renderHistoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.historyItem}
            onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
            }}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
            <View
                style={[
                    styles.itemDetails,
                    { borderLeftColor: getWasteColor(item.response) },
                ]}
            >
                <Text style={styles.userInfo}>
                    {item.user?.name || "Unknown"} ({item.user?.email || "No email"})
                </Text>
                <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.responsePreview} numberOfLines={2}>
                    {item.response}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderPromptItem = ({ item }) => (
        <View style={styles.promptItem}>
            <View style={styles.promptText}>
                <Text style={styles.userInfo}>
                    {item.user?.name || "Unknown"} ({item.user?.email || "No email"})
                </Text>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value} numberOfLines={2}>{item.value}</Text>
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "history" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("history")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "history" && styles.activeTabText,
                        ]}
                    >
                        All History
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "prompts" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("prompts")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "prompts" && styles.activeTabText,
                        ]}
                    >
                        All Prompts
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={activeTab === "history" ? allHistory : allPrompts}
                renderItem={activeTab === "history" ? renderHistoryItem : renderPromptItem}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#4CAF50"]}
                        tintColor="#4CAF50"
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        No data available
                    </Text>
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>

                        {selectedItem && (
                            <ScrollView>
                                <Image
                                    source={{ uri: selectedItem.imageUrl }}
                                    style={styles.modalImage}
                                />
                                <Text style={styles.modalUserInfo}>
                                    {selectedItem.user?.name || "Unknown"} ({selectedItem.user?.email || "No email"})
                                </Text>
                                <Text style={styles.modalTimestamp}>
                                    {new Date(selectedItem.timestamp).toLocaleString()}
                                </Text>
                                <Markdown style={markdownStyles}>
                                    {selectedItem.response}
                                </Markdown>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const markdownStyles = {
    body: { color: "#333", fontSize: 14 },
    heading1: { fontSize: 18, fontWeight: "bold", marginVertical: 8 },
    heading2: { fontSize: 16, fontWeight: "bold", marginVertical: 8 },
    paragraph: { marginVertical: 8 },
    list_item: { marginLeft: 8 },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#4CAF50",
    },
    tabText: {
        fontSize: 16,
        color: "#757575",
    },
    activeTabText: {
        color: "#4CAF50",
        fontWeight: "bold",
    },
    historyItem: {
        flexDirection: "row",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 4,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
        borderLeftWidth: 4,
        paddingLeft: 8,
    },
    userInfo: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    timestamp: {
        fontSize: 12,
        color: "#757575",
        marginBottom: 4,
    },
    responsePreview: {
        fontSize: 14,
        color: "#333",
    },
    promptItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    promptText: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        color: "#555",
    },
    emptyText: {
        textAlign: "center",
        marginTop: 40,
        fontSize: 16,
        color: "#757575",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    closeButton: {
        alignSelf: "flex-end",
        padding: 5,
    },
    modalImage: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
        resizeMode: "cover",
    },
    modalUserInfo: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    modalTimestamp: {
        fontSize: 14,
        color: "#757575",
        marginBottom: 10,
    },
});