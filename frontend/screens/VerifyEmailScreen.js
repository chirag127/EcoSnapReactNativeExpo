import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from "react-native";
import { showAlert } from "../utils/alertUtils";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailScreen({ onBack }) {
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const { user, verifyEmail, resendVerificationCode } = useAuth();

    const handleVerify = async () => {
        if (loading) return;
        if (!verificationCode) {
            showAlert("Error", "Please enter the verification code");
            return;
        }

        setLoading(true);
        try {
            const result = await verifyEmail(user.email, verificationCode);
            if (!result.success) {
                showAlert("Error", result.error);
            } else {
                showAlert("Success", "Email verified successfully");
                // No need to call onBack here as the App.js will automatically
                // redirect to the main app once the user is verified
            }
        } catch (error) {
            showAlert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendLoading) return;

        setResendLoading(true);
        try {
            const result = await resendVerificationCode(user.email);
            if (!result.success) {
                showAlert("Error", result.error);
            } else {
                showAlert("Success", "Verification code resent to your email");
            }
        } catch (error) {
            showAlert("Error", error.message);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formContainer}>
                    <View style={styles.form}>
                        <Text style={styles.title}>Verify Your Email</Text>
                        <Text style={styles.subtitle}>
                            We've sent a verification code to {user?.email}.
                            Please enter it below.
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Verification Code"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            autoCapitalize="none"
                        />

                        <TouchableOpacity
                            style={[
                                styles.button,
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? "Verifying..." : "Verify Email"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.resendButton,
                                resendLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleResendCode}
                            disabled={resendLoading}
                        >
                            <Text style={styles.resendButtonText}>
                                {resendLoading ? "Sending..." : "Resend Code"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={onBack}
                        >
                            <Text style={styles.backButtonText}>
                                Back to Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    formContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    form: {
        width: "100%",
        maxWidth: isWeb ? 450 : "100%",
        padding: 25,
        backgroundColor: "#fff",
        borderRadius: 10,
        ...(isWeb && {
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
        }),
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#333",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
        textAlign: "center",
        lineHeight: 22,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        backgroundColor: "#f9f9f9",
        padding: 15,
        marginBottom: 20,
        borderRadius: 8,
        fontSize: 16,
        ...(isWeb && {
            transition: "border-color 0.3s",
            outline: "none",
        }),
    },
    button: {
        backgroundColor: "#4CAF50",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 15,
        ...(isWeb && {
            cursor: "pointer",
            transition: "background-color 0.3s",
        }),
    },
    buttonDisabled: {
        backgroundColor: "#a5d6a7",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    resendButton: {
        marginTop: 15,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#4CAF50",
        backgroundColor: "transparent",
        ...(isWeb && {
            cursor: "pointer",
            transition: "background-color 0.3s, border-color 0.3s",
        }),
    },
    resendButtonText: {
        color: "#4CAF50",
        fontSize: 16,
        fontWeight: "500",
    },
    backButton: {
        marginTop: 25,
        alignItems: "center",
        padding: 10,
        ...(isWeb && {
            cursor: "pointer",
        }),
    },
    backButtonText: {
        color: "#666",
        fontSize: 16,
        ...(isWeb && {
            transition: "color 0.3s",
        }),
    },
});
