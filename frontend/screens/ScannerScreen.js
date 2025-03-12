import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    RefreshControl,
    Clipboard,
    TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import axios from "axios";
import { API_URL } from "../env";
import * as ImageManipulator from "expo-image-manipulator";
import Markdown from "react-native-markdown-display";
import { Picker } from "@react-native-picker/picker";

const compressImage = async (uri) => {
    try {
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1024 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipResult.uri;
    } catch (error) {
        console.error("Image compression error:", error);
        throw error;
    }
};

export default function ScannerScreen() {
    const [image, setImage] = useState(null);
    const [classification, setClassification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [prompts, setPrompts] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState("1");
    const [customPrompt, setCustomPrompt] = useState("");
    const [showCustomPrompt, setShowCustomPrompt] = useState(false);

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const response = await axios.get(`${API_URL}/prompts`);
            setPrompts(response.data);
        } catch (error) {
            console.error("Failed to fetch prompts:", error);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Reset screen state
        setImage(null);
        setClassification(null);
        setRefreshing(false);
    }, []);

    const takePhoto = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === "granted") {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            // Check if the user canceled the image picker
            // the result is of format { canceled: false, assets: [{ uri: '...' }] }
            if (!result.canceled) {
                // Set the image state with the selected image URI
                setImage(result.assets[0].uri);
                classifyImage(result.assets[0].uri);
            }
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        // the result is of format { canceled: false, assets: [{ uri: '...' }] }
        // Check if the user canceled the image picker
        if (!result.canceled) {
            // Set the image state with the selected image URI
            setImage(result.assets[0].uri);

            classifyImage(result.assets[0].uri);
        }
    };

    const classifyImage = async (imageUri) => {
        try {
            setIsLoading(true);
            setClassification("Processing...");

            // Compress image before processing
            const compressedUri = await compressImage(imageUri);
            const response = await fetch(compressedUri);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onload = async () => {
                const base64data = reader.result.split(",")[1];
                try {
                    const result = await axios.post(`${API_URL}/classify`, {
                        image: base64data,
                        prompt: showCustomPrompt
                            ? customPrompt
                            : prompts.find((p) => p.id === selectedPrompt)
                                  ?.value,
                    });
                    setClassification(result.data.response);
                } catch (error) {
                    console.error(
                        "Classification error:",
                        error.response?.data || error.message
                    );
                    Alert.alert("Error", "Failed to classify image");
                    setClassification(null);
                } finally {
                    setIsLoading(false);
                }
            };

            reader.readAsDataURL(blob);
        } catch (error) {
            console.error("Image processing error:", error);
            Alert.alert("Error", "Failed to process image");
            setClassification(null);
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        await Clipboard.setString(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset copied status after 2 seconds
    };

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#4CAF50"]}
                        tintColor="#4CAF50"
                    />
                }
            >
                {image && (
                    <Image source={{ uri: image }} style={styles.image} />
                )}

                <View style={styles.promptContainer}>
                    <Picker
                        selectedValue={selectedPrompt}
                        style={styles.picker}
                        onValueChange={(itemValue) => {
                            setSelectedPrompt(itemValue);
                            setShowCustomPrompt(itemValue === "custom");
                        }}
                    >
                        {prompts.map((prompt) => (
                            <Picker.Item
                                key={prompt.id}
                                label={prompt.label}
                                value={prompt.id}
                            />
                        ))}
                        <Picker.Item label="Custom Prompt" value="custom" />
                    </Picker>

                    {showCustomPrompt && (
                        <TextInput
                            style={styles.customPromptInput}
                            placeholder="Enter your custom prompt"
                            value={customPrompt}
                            onChangeText={setCustomPrompt}
                            multiline
                        />
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={takePhoto}>
                        <Text style={styles.buttonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={pickImage}>
                        <Text style={styles.buttonText}>Pick Image</Text>
                    </TouchableOpacity>
                </View>
                {classification && (
                    <View style={styles.resultContainer}>
                        <TouchableOpacity
                            onPress={() => copyToClipboard(classification)}
                        >
                            <Markdown style={markdownStyles}>
                                {classification}
                            </Markdown>
                            {isCopied && (
                                <Text style={styles.copiedText}>
                                    Copied to clipboard!
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const markdownStyles = {
    body: { color: "#333", fontSize: 16 },
    heading1: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        marginVertical: 10,
    },
    heading2: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        marginVertical: 8,
    },
    paragraph: { marginVertical: 8, lineHeight: 22 },
    list: { marginVertical: 8 },
    listItem: { marginVertical: 4 },
    listUnorderedItemIcon: { fontSize: 8, marginRight: 10 },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    image: {
        width: 300,
        height: 300,
        marginBottom: 20,
        borderRadius: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    button: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 5,
        minWidth: 120,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
    },
    resultContainer: {
        marginTop: 20,
        padding: 15,
        borderRadius: 5,
        backgroundColor: "#f0f0f0",
    },
    resultText: {
        fontSize: 18,
    },
    copiedText: {
        color: "#4CAF50",
        fontSize: 14,
        textAlign: "center",
        marginTop: 5,
    },
    promptContainer: {
        marginBottom: 20,
        width: "100%",
    },
    picker: {
        width: "100%",
        backgroundColor: "#f0f0f0",
        borderRadius: 5,
        marginBottom: 10,
    },
    customPromptInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        backgroundColor: "#fff",
        minHeight: 80,
        textAlignVertical: "top",
    },
});
