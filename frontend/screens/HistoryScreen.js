import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Image, Text } from "react-native";

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // TODO: Implement fetch from backend
        setHistory([]);
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.historyItem}>
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
            <View style={styles.itemDetails}>
                <Text style={styles.classification}>{item.classification}</Text>
                <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleString()}
                </Text>
            </View>
        </View>
    );

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
});
