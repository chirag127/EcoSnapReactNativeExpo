import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    Modal,
    Platform,
} from "react-native";
import { showAlert } from "../utils/alertUtils";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "../env";
import { useDebounce } from "../hooks/useDebounce";
import { useAuth } from "../context/AuthContext";

const EditModal = ({
    visible,
    onClose,
    onSave,
    label,
    value,
    onLabelChange,
    onValueChange,
    isLoading,
}) => (
    <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Prompt</Text>

                <TextInput
                    style={styles.modalInput}
                    placeholder="Prompt Label"
                    value={label}
                    onChangeText={onLabelChange}
                />

                <TextInput
                    style={[styles.modalInput, styles.multilineInput]}
                    placeholder="Prompt Value"
                    value={value}
                    onChangeText={onValueChange}
                    multiline
                />

                <View style={styles.modalButtons}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={onClose}
                    >
                        <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.modalButton, styles.saveButton]}
                        onPress={onSave}
                        disabled={isLoading}
                    >
                        <Text style={styles.modalButtonText}>
                            {isLoading ? "Saving..." : "Save"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

export default function PromptsScreen() {
    const [prompts, setPrompts] = useState([]);
    const [newLabel, setNewLabel] = useState("");
    const [newValue, setNewValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [editLabel, setEditLabel] = useState("");
    const [editValue, setEditValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay
    const { logout } = useAuth();

    const handleAuthError = () => {
        showAlert("Session Expired", "Please log in again", [
            { text: "OK", onPress: () => logout() },
        ]);
    };

    // Filter prompts based on search query
    const filteredPrompts = prompts.filter(
        (prompt) =>
            prompt.label
                .toLowerCase()
                .includes(debouncedSearchQuery.toLowerCase()) ||
            prompt.value
                .toLowerCase()
                .includes(debouncedSearchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const response = await axios.get(`${API_URL}/prompts`);
            setPrompts(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                handleAuthError();
            } else {
                showAlert("Error", "Failed to fetch prompts");
            }
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchPrompts().finally(() => setRefreshing(false));
    }, []);

    const addPrompt = async () => {
        if (!newLabel.trim() || !newValue.trim()) {
            showAlert("Error", "Please fill in both fields");
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post(`${API_URL}/prompts`, {
                label: newLabel,
                value: newValue,
            });
            setNewLabel("");
            setNewValue("");
            setPrompts([...prompts, response.data]);
        } catch (error) {
            if (error.response?.status === 401) {
                handleAuthError();
            } else {
                showAlert("Error", "Failed to add prompt");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const deletePrompt = async (id) => {
        // Use the same confirmation approach for all platforms with our custom dialog
        showAlert(
            "Confirm Delete",
            "Are you sure you want to delete this prompt?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/prompts/${id}`);
                            setPrompts(prompts.filter((p) => p._id !== id));
                        } catch (error) {
                            if (error.response?.status === 401) {
                                handleAuthError();
                            } else {
                                showAlert("Error", "Failed to delete prompt");
                            }
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = (prompt) => {
        setEditingPrompt(prompt);
        setEditLabel(prompt.label);
        setEditValue(prompt.value);
        setEditModalVisible(true);
    };

    const saveEdit = async () => {
        if (!editLabel.trim() || !editValue.trim()) {
            showAlert("Error", "Please fill in both fields");
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.put(
                `${API_URL}/prompts/${editingPrompt._id}`,
                {
                    label: editLabel,
                    value: editValue,
                }
            );

            setPrompts(
                prompts.map((p) =>
                    p._id === editingPrompt._id ? response.data : p
                )
            );

            setEditModalVisible(false);
            setEditingPrompt(null);
        } catch (error) {
            if (error.response?.status === 401) {
                handleAuthError();
            } else {
                showAlert("Error", "Failed to update prompt");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = useCallback(() => {
        setEditModalVisible(false);
        setEditLabel("");
        setEditValue("");
        setEditingPrompt(null);
    }, []);

    const handleLabelChange = useCallback((text) => {
        setEditLabel(text);
    }, []);

    const handleValueChange = useCallback((text) => {
        setEditValue(text);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Prompt Label"
                    value={newLabel}
                    onChangeText={setNewLabel}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Prompt Value"
                    value={newValue}
                    onChangeText={setNewValue}
                    multiline
                />
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={addPrompt}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? "Adding..." : "Add Prompt"}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredPrompts} // Use filtered prompts instead of all prompts
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => (
                    <View style={styles.promptItem}>
                        <View style={styles.promptText}>
                            <Text style={styles.label}>{item.label}</Text>
                            <Text style={styles.value}>{item.value}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.iconButton, styles.editButton]}
                                onPress={() => handleEdit(item)}
                            >
                                <Ionicons
                                    name="pencil"
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, styles.deleteButton]}
                                onPress={() =>
                                    deletePrompt(item._id || item.id)
                                }
                            >
                                <Ionicons name="trash" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
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
            <EditModal
                visible={editModalVisible}
                onClose={handleClose}
                onSave={saveEdit}
                label={editLabel}
                value={editValue}
                onLabelChange={handleLabelChange}
                onValueChange={handleValueChange}
                isLoading={isLoading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    addButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    promptItem: {
        flexDirection: "row",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        alignItems: "center",
    },
    promptText: {
        flex: 1,
    },
    label: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 4,
    },
    value: {
        color: "#666",
    },
    deleteButton: {
        backgroundColor: "#ff4444",
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    deleteButtonText: {
        color: "#fff",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        width: "90%",
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: "top",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#ff4444",
    },
    saveButton: {
        backgroundColor: "#4CAF50",
    },
    modalButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButton: {
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    editButton: {
        backgroundColor: "#2196F3",
    },
    deleteButton: {
        backgroundColor: "#ff4444",
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        backgroundColor: "#fff",
    },
});
