import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import axios from "axios";
import { API_URL } from "../env";

export default function ScannerScreen() {
    const [image, setImage] = useState(null);
    const [classification, setClassification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const takePhoto = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === "granted") {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.canceled) {
                setImage(result.assets[0].uri);
                classifyImage(result.assets[0].uri);
            }
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
            classifyImage(result.assets[0].uri);
        }
    };

    const classifyImage = async (imageUri) => {
        try {
            setIsLoading(true);
            setClassification("Processing...");

            // Convert image to base64
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onload = async () => {
                const base64data = reader.result.split(",")[1];

                try {
                    const result = await axios.post(`${API_URL}/classify`, {
                        image: base64data,
                    });

                    setClassification(result.data.response);
                } catch (error) {
                    console.error("Classification error:", error);
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

    return (
        <View style={styles.container}>
            {image && <Image source={{ uri: image }} style={styles.image} />}
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
                    <Text style={styles.resultText}>{classification}</Text>
                </View>
            )}
        </View>
    );
}

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
});
