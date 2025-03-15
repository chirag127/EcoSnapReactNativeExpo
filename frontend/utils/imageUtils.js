import { Platform } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * Compresses an image for web platforms using Canvas API
 * @param {string} dataUri - The data URI of the image
 * @param {number} maxWidth - Maximum width of the compressed image
 * @param {number} quality - Quality of the compressed image (0-1)
 * @returns {Promise<string>} - Promise that resolves to the compressed image data URI
 */
const compressImageForWeb = (dataUri, maxWidth = 1024, quality = 0.6) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = (error) => {
            reject(error);
        };
        img.src = dataUri;
    });
};

/**
 * Platform-agnostic image compression function
 * @param {string} uri - The URI of the image to compress
 * @returns {Promise<string>} - Promise that resolves to the compressed image URI
 */
export const compressImage = async (uri) => {
    try {
        // For web platform, use Canvas API
        if (Platform.OS === "web") {
            console.log("Using web-specific image compression");
            return await compressImageForWeb(uri);
        }

        // For native platforms, use ImageManipulator
        console.log("Using native image compression");
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
