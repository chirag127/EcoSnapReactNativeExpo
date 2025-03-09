import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    Image,
    Text,
    ActivityIndicator,
} from "react-native";
import axios from "axios";

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                "http://your-backend-url:5000/api/history"
            );
            setHistory(response.data);
        } catch (err) {
            setError("Failed to load history");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.historyItem}>
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
            <View style={styles.itemDetails}>
                <Text style={styles.classification}>{item.response}</Text>
                <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleString()}
                </Text>
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
            />
        </View>
    );
}

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
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 5,
    },
    itemDetails: {
        marginLeft: 15,
        justifyContent: "center",
    },
    classification: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    timestamp: {
        color: "#666",
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
