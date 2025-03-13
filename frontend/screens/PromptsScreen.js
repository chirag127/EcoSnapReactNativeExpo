import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    RefreshControl,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../env';

export default function PromptsScreen() {
    const [prompts, setPrompts] = useState([]);
    const [newLabel, setNewLabel] = useState('');
    const [newValue, setNewValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const response = await axios.get(`${API_URL}/prompts`);
            setPrompts(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch prompts');
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchPrompts()
            .finally(() => setRefreshing(false));
    }, []);

    const addPrompt = async () => {
        if (!newLabel.trim() || !newValue.trim()) {
            Alert.alert('Error', 'Please fill in both fields');
            return;
        }

        try {
            setIsLoading(true);
            await axios.post(`${API_URL}/prompts`, {
                label: newLabel,
                value: newValue,
            });
            setNewLabel('');
            setNewValue('');
            fetchPrompts();
        } catch (error) {
            Alert.alert('Error', 'Failed to add prompt');
        } finally {
            setIsLoading(false);
        }
    };

    const deletePrompt = async (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this prompt?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/prompts/${id}`);
                            fetchPrompts();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete prompt');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
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
                        {isLoading ? 'Adding...' : 'Add Prompt'}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={prompts}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => (
                    <View style={styles.promptItem}>
                        <View style={styles.promptText}>
                            <Text style={styles.label}>{item.label}</Text>
                            <Text style={styles.value}>{item.value}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deletePrompt(item._id || item.id)}
                        >
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    promptItem: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
    },
    promptText: {
        flex: 1,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    value: {
        color: '#666',
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    deleteButtonText: {
        color: '#fff',
    },
});