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
    Dimensions,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import VerifyEmailScreen from "./VerifyEmailScreen";

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        login,
        register,
        pendingVerification,
        user,
        resetVerificationState,
    } = useAuth();

    const [showVerification, setShowVerification] = useState(false);

    useEffect(() => {
        // If user is logged in but not verified, show verification screen
        if (pendingVerification || (user && !user.isVerified)) {
            setShowVerification(true);
        } else {
            setShowVerification(false);
        }
    }, [user, pendingVerification]);

    const handleSubmit = async () => {
        if (loading) return;

        if (!email || !password || (!isLogin && !name)) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            let result;
            if (isLogin) {
                result = await login(email, password);
            } else {
                result = await register(name, email, password);
            }

            if (!result.success && !result.needsVerification) {
                // Show more detailed error message
                const errorDetails = result.details
                    ? `\n\nDetails: ${result.details}`
                    : "";
                Alert.alert("Error", `${result.error}${errorDetails}`);
            } else if (
                result.needsVerification ||
                (result.success && !isLogin)
            ) {
                // Show verification message
                Alert.alert(
                    "Verification Required",
                    "A verification code has been sent to your email. Please verify your account."
                );
                setShowVerification(true);
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackFromVerification = () => {
        // Allow going back to login screen
        setShowVerification(false);
        resetVerificationState();

        // If the user was in the middle of registration, clear the form
        if (!isLogin) {
            setIsLogin(true);
            setName("");
            setEmail("");
            setPassword("");
        }
    };

    if (showVerification) {
        return <VerifyEmailScreen onBack={handleBackFromVerification} />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formContainer}>
                    <View style={styles.form}>
                        <Text style={styles.title}>
                            {isLogin ? "Welcome Back!" : "Create Account"}
                        </Text>

                        {!isLogin && (
                            <TextInput
                                style={styles.input}
                                placeholder="Name"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[
                                styles.button,
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading
                                    ? "Loading..."
                                    : isLogin
                                    ? "Login"
                                    : "Register"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => setIsLogin(!isLogin)}
                        >
                            <Text style={styles.switchButtonText}>
                                {isLogin
                                    ? "Don't have an account? Register"
                                    : "Already have an account? Login"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

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
        marginBottom: 30,
        textAlign: "center",
        color: "#333",
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
    switchButton: {
        marginTop: 25,
        alignItems: "center",
        ...(isWeb && {
            cursor: "pointer",
        }),
    },
    switchButtonText: {
        color: "#4CAF50",
        fontSize: 16,
        ...(isWeb && {
            transition: "color 0.3s",
        }),
    },
});
