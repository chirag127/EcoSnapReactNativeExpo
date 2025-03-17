import React, { useState, useRef } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator,
    ScrollView,
    PanResponder,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import * as FileSystem from "expo-file-system";
import { captureRef } from "react-native-view-shot";
import { Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const CANVAS_WIDTH = width - 40;
const CANVAS_HEIGHT = height * 0.6;

export default function DrawCanvasScreen({ navigation }) {
    // Use useRef for mutable values that shouldn't trigger re-renders
    const pathsRef = useRef([]);
    const currentPointsRef = useRef([]);

    // Use state for values that should trigger re-renders
    const [paths, setPaths] = useState([]);
    const [currentPoints, setCurrentPoints] = useState([]);
    const [color, setColor] = useState("#000000");
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [saving, setSaving] = useState(false);
    const [, forceUpdate] = useState(0); // Used to force re-renders

    const canvasRef = useRef(null);

    // Convert points to SVG path
    const pointsToSvgPath = (points) => {
        if (points.length < 2) return "";

        let path = `M ${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x},${points[i].y}`;
        }
        return path;
    };

    // PanResponder for handling touch events
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                // Get the location relative to the canvas
                const { locationX, locationY } = evt.nativeEvent;

                // Use refs for immediate updates without re-rendering
                currentPointsRef.current = [{ x: locationX, y: locationY }];

                // Update state for rendering
                setCurrentPoints(currentPointsRef.current);
            },
            onPanResponderMove: (evt, gestureState) => {
                // Get the location relative to the canvas
                const { locationX, locationY } = evt.nativeEvent;

                // Only add the point if it's within the canvas bounds
                if (
                    locationX >= 0 &&
                    locationX <= CANVAS_WIDTH &&
                    locationY >= 0 &&
                    locationY <= CANVAS_HEIGHT
                ) {
                    // Update ref immediately
                    currentPointsRef.current = [
                        ...currentPointsRef.current,
                        { x: locationX, y: locationY },
                    ];

                    // Update state less frequently to avoid too many re-renders
                    // This improves performance while drawing
                    if (currentPointsRef.current.length % 5 === 0) {
                        setCurrentPoints([...currentPointsRef.current]);
                    }
                }
            },
            onPanResponderRelease: () => {
                if (currentPointsRef.current.length > 1) {
                    // Update refs
                    pathsRef.current = [
                        ...pathsRef.current,
                        {
                            points: currentPointsRef.current,
                            color,
                            strokeWidth,
                        },
                    ];

                    // Update state for rendering
                    setPaths([...pathsRef.current]);
                }

                // Reset current points
                currentPointsRef.current = [];
                setCurrentPoints([]);

                // Force a re-render to ensure the canvas updates
                forceUpdate((prev) => prev + 1);
            },
        })
    ).current;

    const clearCanvas = () => {
        // Clear both refs and state
        pathsRef.current = [];
        currentPointsRef.current = [];
        setPaths([]);
        setCurrentPoints([]);
        forceUpdate((prev) => prev + 1); // Force re-render
    };

    const saveCanvas = async () => {
        if (paths.length === 0) {
            Alert.alert("Empty Canvas", "Please draw something first");
            return;
        }

        try {
            setSaving(true);
            console.log("Starting canvas capture...");

            // Capture options based on platform
            const captureOptions = {
                format: "png",
                quality: 1,
                // On web, we can't use 'file' result type
                result: Platform.OS === "web" ? "data-uri" : "file",
            };

            console.log("Canvas ref:", canvasRef.current ? "exists" : "null");
            console.log("Capture options:", captureOptions);

            // Ensure the canvas ref exists
            if (!canvasRef.current) {
                throw new Error("Canvas reference is not available");
            }

            // Capture the canvas view
            const uri = await captureRef(canvasRef, captureOptions);

            console.log(
                "Canvas captured successfully:",
                uri.substring(0, 50) + "..."
            );

            // Make sure we have a valid URI
            if (!uri) {
                throw new Error("Failed to capture canvas - no URI returned");
            }

            // Navigate back to Scanner screen with the sketch URI
            navigation.navigate("Scanner", { sketchUri: uri });
            console.log("Navigation triggered");
        } catch (error) {
            console.error("Error saving canvas:", error);
            Alert.alert("Error", "Failed to save canvas: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const colorOptions = [
        { color: "#000000", name: "Black" },
        { color: "#FF0000", name: "Red" },
        { color: "#0000FF", name: "Blue" },
        { color: "#008000", name: "Green" },
    ];

    const strokeOptions = [
        { width: 2, name: "Thin" },
        { width: 5, name: "Medium" },
        { width: 10, name: "Thick" },
        { width: 15, name: "Extra Thick" },
    ];

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Draw Your Sketch</Text>

                <View style={styles.canvasContainer}>
                    {/* Canvas container with fixed dimensions */}
                    <View style={styles.canvasWrapper}>
                        {/* Actual drawing area with pan responder */}
                        <View
                            ref={canvasRef}
                            style={styles.canvas}
                            {...panResponder.panHandlers}
                            collapsable={
                                false
                            } /* Important for view-shot to work */
                            onTouchStart={
                                Platform.OS === "web"
                                    ? (e) => e.preventDefault()
                                    : undefined
                            }
                            onTouchMove={
                                Platform.OS === "web"
                                    ? (e) => e.preventDefault()
                                    : undefined
                            }
                            onTouchEnd={
                                Platform.OS === "web"
                                    ? (e) => e.preventDefault()
                                    : undefined
                            }
                        >
                            <Svg
                                width={CANVAS_WIDTH}
                                height={CANVAS_HEIGHT}
                                style={{ backgroundColor: "#ffffff" }}
                            >
                                {/* Background rectangle to ensure the entire canvas is captured */}
                                <Path
                                    d={`M 0,0 H ${CANVAS_WIDTH} V ${CANVAS_HEIGHT} H 0 Z`}
                                    fill="#ffffff"
                                    stroke="none"
                                />

                                {/* Render completed paths */}
                                {pathsRef.current.map((path, index) => (
                                    <Path
                                        key={`path-${index}`}
                                        d={pointsToSvgPath(path.points)}
                                        stroke={path.color}
                                        strokeWidth={path.strokeWidth}
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                ))}

                                {/* Render current path being drawn */}
                                {currentPointsRef.current.length > 1 && (
                                    <Path
                                        key="current-path"
                                        d={pointsToSvgPath(
                                            currentPointsRef.current
                                        )}
                                        stroke={color}
                                        strokeWidth={strokeWidth}
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}
                            </Svg>
                        </View>
                    </View>
                </View>

                <View style={styles.toolsContainer}>
                    <Text style={styles.toolTitle}>Colors:</Text>
                    <View style={styles.colorOptions}>
                        {colorOptions.map((option) => (
                            <TouchableOpacity
                                key={option.color}
                                style={[
                                    styles.colorOption,
                                    { backgroundColor: option.color },
                                    color === option.color &&
                                        styles.selectedOption,
                                ]}
                                onPress={() => setColor(option.color)}
                            />
                        ))}
                    </View>

                    <Text style={styles.toolTitle}>Stroke Width:</Text>
                    <View style={styles.strokeOptions}>
                        {strokeOptions.map((option) => (
                            <TouchableOpacity
                                key={option.width}
                                style={[
                                    styles.strokeOption,
                                    strokeWidth === option.width &&
                                        styles.selectedOption,
                                ]}
                                onPress={() => setStrokeWidth(option.width)}
                            >
                                <Text style={styles.strokeText}>
                                    {option.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearCanvas}
                    >
                        <Text style={styles.buttonText}>Clear</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveCanvas}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginTop: 40,
        marginBottom: 20,
    },
    canvasContainer: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        backgroundColor: "#fff",
        overflow: "hidden",
        marginBottom: 20,
        ...(Platform.OS === "web" && {
            touchAction: "none", // Prevents browser handling of all touch gestures
        }),
    },
    canvasWrapper: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: "#fff",
        position: "relative",
        ...(Platform.OS === "web" && {
            touchAction: "none", // Prevents browser handling of all touch gestures
        }),
    },
    canvas: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: "#fff",
        position: "absolute",
        top: 0,
        left: 0,
        ...(Platform.OS === "web" && {
            touchAction: "none", // Prevents browser handling of touch gestures
            WebkitTouchCallout: "none", // Disables callout
            WebkitUserSelect: "none", // Disables selection
            userSelect: "none", // Disables selection
        }),
    },
    toolsContainer: {
        marginTop: 20,
    },
    toolTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        color: "#333",
    },
    colorOptions: {
        flexDirection: "row",
        marginBottom: 15,
    },
    colorOption: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 15,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    strokeOptions: {
        flexDirection: "row",
        marginBottom: 15,
    },
    strokeOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 10,
        backgroundColor: "#e0e0e0",
    },
    strokeText: {
        fontSize: 12,
    },
    selectedOption: {
        borderWidth: 2,
        borderColor: "#4a90e2",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
    },
    clearButton: {
        backgroundColor: "#f44336",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 3,
    },
    saveButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 3,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});
