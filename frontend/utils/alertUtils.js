import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import WebDialog from "../components/WebDialog";

/**
 * Global state to manage web dialog visibility and props
 */
let dialogState = {
    visible: false,
    title: "",
    message: "",
    buttons: [],
    onClose: () => {},
    setDialogState: null,
};

/**
 * Register the dialog state setter function
 * @param {Function} setStateFn - React state setter function
 */
export const registerDialogStateSetter = (setStateFn) => {
    dialogState.setDialogState = setStateFn;
};

/**
 * Show an alert dialog that is platform-aware
 * Uses Alert.alert on native platforms and a custom dialog on web
 *
 * @param {string} title - The title of the alert
 * @param {string} message - The message to display
 * @param {Array} buttons - Array of button objects with text and onPress properties
 */
export const showAlert = (title, message, buttons = []) => {
    if (Platform.OS === "web") {
        // For web platform, use our custom dialog
        if (dialogState.setDialogState) {
            dialogState.setDialogState({
                visible: true,
                title,
                message,
                buttons,
                onClose: () => {
                    dialogState.setDialogState((prev) => ({
                        ...prev,
                        visible: false,
                    }));
                },
            });
        } else {
            // Fallback to browser's alert if our dialog system isn't initialized
            alert(`${title}\n${message}`);
        }
    } else {
        // For native platforms, use React Native's Alert
        Alert.alert(title, message, buttons);
    }
};

/**
 * Dialog provider component that should be placed at the root of your app
 */
export const DialogProvider = ({ children }) => {
    const [dialog, setDialog] = useState({
        visible: false,
        title: "",
        message: "",
        buttons: [],
        onClose: () => {},
    });

    // Register the state setter on mount
    React.useEffect(() => {
        registerDialogStateSetter(setDialog);
        return () => {
            // Clean up on unmount
            dialogState.setDialogState = null;
        };
    }, []);

    return (
        <>
            {children}
            {Platform.OS === "web" && (
                <WebDialog
                    visible={dialog.visible}
                    title={dialog.title}
                    message={dialog.message}
                    buttons={dialog.buttons}
                    onClose={dialog.onClose}
                />
            )}
        </>
    );
};
