import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from "react-native";

/**
 * A dialog component for web platform that mimics the Alert.alert API
 * @param {Object} props - Component props
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {Array} props.buttons - Array of button objects with text and onPress
 * @param {boolean} props.visible - Whether the dialog is visible
 * @param {Function} props.onClose - Function to call when dialog is closed
 */
const WebDialog = ({ title, message, buttons = [], visible, onClose }) => {
    // If no buttons provided, add a default OK button
    const dialogButtons =
        buttons.length > 0 ? buttons : [{ text: "OK", onPress: onClose }];

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {title && <Text style={styles.modalTitle}>{title}</Text>}
                    {message && <Text style={styles.modalText}>{message}</Text>}

                    <View style={styles.buttonContainer}>
                        {dialogButtons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    button.style === "cancel"
                                        ? styles.cancelButton
                                        : button.style === "destructive"
                                        ? styles.destructiveButton
                                        : styles.defaultButton,
                                    index > 0 && { marginLeft: 8 },
                                ]}
                                onPress={() => {
                                    if (button.onPress) button.onPress();
                                    onClose();
                                }}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        button.style === "destructive" &&
                                            styles.destructiveText,
                                    ]}
                                >
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minWidth: 300,
        maxWidth: "80%",
    },
    modalTitle: {
        marginBottom: 10,
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 18,
    },
    modalText: {
        marginBottom: 20,
        textAlign: "center",
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        minWidth: 80,
        alignItems: "center",
    },
    defaultButton: {
        backgroundColor: "#4CAF50",
    },
    cancelButton: {
        backgroundColor: "#e0e0e0",
    },
    destructiveButton: {
        backgroundColor: "#f44336",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    destructiveText: {
        color: "white",
    },
});

export default WebDialog;
