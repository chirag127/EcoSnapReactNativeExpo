import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    Image,
    Text,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native";
import axios from "axios";
import { API_URL } from "../env";
import Markdown from "react-native-markdown-display";
import { useAuth } from "../context/AuthContext";

const getWasteColor = (response) => {
    const text = response.toLowerCase();
    if (text.includes("recyclable")) return "#4CAF50";
    if (text.includes("compostable")) return "#FF9800";
    if (text.includes("landfill")) return "#F44336";
    return "#757575";
};

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { logout } = useAuth();

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_URL}/history`);
            setHistory(response.data);
        } catch (err) {
            if (err.response?.status === 401) {
                Alert.alert("Session Expired", "Please log in again", [
                    { text: "OK", onPress: () => logout() },
                ]);
            } else {
                setError("Failed to load history");
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchHistory().finally(() => setRefreshing(false));
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.historyItem}>
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
            <View
                style={[
                    styles.itemDetails,
                    { borderLeftColor: getWasteColor(item.response) },
                ]}
            >
                <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleString()}
                </Text>
                <Markdown style={markdownStyles}>{item.response}</Markdown>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No history available</Text>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#4CAF50"]}
                        tintColor="#4CAF50"
                    />
                }
            />
        </View>
    );
}

const markdownStyles = {
    body: { color: "#333", fontSize: 14 },
    heading1: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        marginVertical: 6,
    },
    heading2: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        marginVertical: 4,
    },
    paragraph: { marginVertical: 4, lineHeight: 20 },
    list: { marginVertical: 4 },
    listItem: { marginVertical: 2 },
    listUnorderedItemIcon: { fontSize: 6, marginRight: 8 },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    historyItem: {
        flexDirection: "row",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        marginVertical: 4,
        marginHorizontal: 8,
        borderRadius: 8,
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 15,
        borderLeftWidth: 4,
        paddingLeft: 10,
    },
    classification: {
        fontSize: 16,
        color: "#333",
        marginTop: 4,
        lineHeight: 22,
        flexWrap: "wrap",
    },
    timestamp: {
        color: "#666",
        fontSize: 12,
        marginBottom: 4,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 16,
        color: "#666",
    },
    errorText: {
        color: "red",
        fontSize: 16,
        textAlign: "center",
        marginTop: 50,
    },
});
