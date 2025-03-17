import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailScreen({ onBack }) {
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const { user, verifyEmail, resendVerificationCode } = useAuth();

    const handleVerify = async () => {
        if (loading) return;
        if (!verificationCode) {
            Alert.alert("Error", "Please enter the verification code");
            return;
        }

        setLoading(true);
        try {
            const result = await verifyEmail(user.email, verificationCode);
            if (!result.success) {
                Alert.alert("Error", result.error);
            } else {
                Alert.alert("Success", "Email verified successfully");
                // No need to call onBack here as the App.js will automatically
                // redirect to the main app once the user is verified
            }
        } catch (error) {
            Alert.alert("Error", error.message);
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
                Alert.alert("Error", result.error);
            } else {
                Alert.alert(
                    "Success",
                    "Verification code resent to your email"
                );
            }
        } catch (error) {
            Alert.alert("Error", error.message);
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
                <View style={styles.form}>
                    <Text style={styles.title}>Verify Your Email</Text>
                    <Text style={styles.subtitle}>
                        We've sent a verification code to {user?.email}. Please
                        enter it below.
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
                        <Text style={styles.backButtonText}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    form: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 15,
        marginBottom: 15,
        borderRadius: 5,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: "#a5d6a7",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    resendButton: {
        marginTop: 15,
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#4CAF50",
    },
    resendButtonText: {
        color: "#4CAF50",
        fontSize: 16,
    },
    backButton: {
        marginTop: 20,
        alignItems: "center",
    },
    backButtonText: {
        color: "#666",
        fontSize: 16,
    },
});
