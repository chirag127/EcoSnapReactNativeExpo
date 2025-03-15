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
    Modal,
    Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "../env";
import * as ImageManipulator from "expo-image-manipulator";
import Markdown from "react-native-markdown-display";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import { useAuth } from "../context/AuthContext";

const compressImage = async (uri) => {
    try {
        // Skip image manipulation on web platform
        if (Platform.OS === "web") {
            console.log("Skipping image compression on web platform");
            return uri;
        }

        // Only use ImageManipulator on native platforms
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1024 } }],
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipResult.uri;
    } catch (error) {
        console.error("Image compression error:", error);
        // Return original URI if compression fails
        return uri;
    }
};

export default function ScannerScreen() {
    const [image, setImage] = useState(null);
    const [classification, setClassification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [prompts, setPrompts] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState("custom");
    const [customPrompt, setCustomPrompt] = useState("");
    const [showCustomPrompt, setShowCustomPrompt] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechRate, setSpeechRate] = useState(1.0);
    const [showSpeechSettings, setShowSpeechSettings] = useState(false);
    const { logout } = useAuth();

    const handleAuthError = () => {
        Alert.alert("Session Expired", "Please log in again", [
            { text: "OK", onPress: () => logout() },
        ]);
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Reset all states
        setImage(null);
        setClassification(null);
        setIsCopied(false);
        // Fetch fresh prompts
        fetchPrompts().finally(() => {
            setRefreshing(false);
        });
    }, []);

    const fetchPrompts = async () => {
        try {
            const response = await axios.get(`${API_URL}/prompts`);
            setPrompts(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                handleAuthError();
            } else {
                console.error("Failed to fetch prompts:", error);
            }
        }
    };

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

            // Force a render cycle to ensure "Processing..." is displayed
            await new Promise((resolve) => setTimeout(resolve, 0));

            try {
                // Compress image before processing (will be skipped on web)
                const compressedUri = await compressImage(imageUri);
                console.log("Image compressed/prepared successfully");

                // Process the image
                let base64data;

                if (Platform.OS === "web") {
                    // Web-specific image handling
                    try {
                        // For web, we'll use a different approach to get base64
                        const response = await fetch(compressedUri);
                        const blob = await response.blob();

                        // Use a promise to handle FileReader async operation
                        base64data = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const result = reader.result.split(",")[1];
                                resolve(result);
                            };
                            reader.onerror = (error) => {
                                console.error("FileReader error:", error);
                                reject(error);
                            };
                            reader.readAsDataURL(blob);
                        });

                        console.log(
                            "Web: Image converted to base64 successfully"
                        );
                    } catch (webError) {
                        console.error(
                            "Web-specific image processing error:",
                            webError
                        );
                        throw webError;
                    }
                } else {
                    // Native platforms
                    const response = await fetch(compressedUri);
                    const blob = await response.blob();

                    // Use a promise to handle FileReader async operation
                    base64data = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const result = reader.result.split(",")[1];
                            resolve(result);
                        };
                        reader.onerror = (error) => {
                            console.error("FileReader error:", error);
                            reject(error);
                        };
                        reader.readAsDataURL(blob);
                    });
                }

                // Send the image to the API
                console.log("Sending image to API for classification...");
                const result = await axios.post(`${API_URL}/classify`, {
                    image: base64data,
                    prompt: showCustomPrompt
                        ? customPrompt
                        : prompts.find((p) => p._id === selectedPrompt)
                              ?.value || "",
                });

                console.log("Classification received");
                setClassification(result.data.response);
            } catch (processingError) {
                console.error("Image processing error:", processingError);
                Alert.alert("Error", "Failed to process image");
                setClassification(null);
            } finally {
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Unexpected error in classifyImage:", error);
            Alert.alert("Error", "An unexpected error occurred");
            setClassification(null);
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        await Clipboard.setString(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset copied status after 2 seconds
    };

    const handleSpeak = async (text) => {
        try {
            const isSpeechInProgress = await Speech.isSpeakingAsync();

            if (isSpeechInProgress) {
                await Speech.stop();
                setIsSpeaking(false);
            } else {
                setIsSpeaking(true);
                await Speech.speak(text, {
                    rate: speechRate,
                    onDone: () => setIsSpeaking(false),
                    onError: (error) => {
                        console.error("Speech error:", error);
                        setIsSpeaking(false);
                    },
                });
            }
        } catch (error) {
            console.error("Speech error:", error);
            Alert.alert("Error", "Failed to start text-to-speech");
            setIsSpeaking(false);
        }
    };

    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    const SpeechSettingsModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showSpeechSettings}
            onRequestClose={() => setShowSpeechSettings(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Speech Settings</Text>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>
                            Speed: {speechRate.toFixed(1)}x
                        </Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0.5}
                            maximumValue={4.0}
                            step={0.1}
                            value={speechRate}
                            onValueChange={setSpeechRate}
                            minimumTrackTintColor="#4CAF50"
                            maximumTrackTintColor="#000000"
                            thumbTintColor="#4CAF50"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowSpeechSettings(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
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
                                key={prompt._id || String(Math.random())} // Use MongoDB _id or fallback
                                label={prompt.label}
                                value={prompt._id} // Use MongoDB _id here as well
                            />
                        ))}
                        <Picker.Item
                            key="custom"
                            label="Custom Prompt"
                            value="custom"
                        />
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
                        <View style={styles.resultHeader}>
                            <TouchableOpacity
                                onPress={() => copyToClipboard(classification)}
                                style={styles.iconButton}
                            >
                                <Ionicons
                                    name="copy-outline"
                                    size={24}
                                    color="#4CAF50"
                                />
                                {isCopied && (
                                    <Text style={styles.copiedText}>
                                        Copied!
                                    </Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setShowSpeechSettings(true)}
                                style={styles.iconButton}
                            >
                                <Ionicons
                                    name="settings-outline"
                                    size={20}
                                    color="#4CAF50"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSpeak(classification)}
                                style={styles.iconButton}
                            >
                                <Ionicons
                                    name={
                                        isSpeaking
                                            ? "volume-high"
                                            : "volume-medium-outline"
                                    }
                                    size={24}
                                    color="#4CAF50"
                                />
                            </TouchableOpacity>
                        </View>
                        {isLoading && classification === "Processing..." ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.processingText}>
                                    Processing...
                                </Text>
                            </View>
                        ) : (
                            <Markdown style={markdownStyles}>
                                {classification}
                            </Markdown>
                        )}
                    </View>
                )}
            </ScrollView>
            <SpeechSettingsModal />
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
    loadingContainer: {
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    processingText: {
        fontSize: 18,
        color: "#4CAF50",
        fontWeight: "bold",
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
    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        paddingBottom: 20,
    },
    resultHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    iconButton: {
        padding: 8,
        marginLeft: 16,
        alignItems: "center",
    },
    copiedText: {
        color: "#4CAF50",
        fontSize: 12,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        width: "80%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    settingRow: {
        width: "100%",
        marginBottom: 20,
    },
    settingLabel: {
        fontSize: 16,
        marginBottom: 10,
        color: "#666",
    },
    slider: {
        width: "100%",
        height: 40,
    },
    closeButton: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    closeButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
