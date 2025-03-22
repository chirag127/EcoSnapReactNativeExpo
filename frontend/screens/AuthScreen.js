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
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { showAlert } from "../utils/alertUtils";
import { useAuth } from "../context/AuthContext";
import VerifyEmailScreen from "./VerifyEmailScreen";

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    // Password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password reset states
    const [isPasswordReset, setIsPasswordReset] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Email entry, 2: Code + new password
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const {
        login,
        register,
        pendingVerification,
        user,
        resetVerificationState,
        requestPasswordReset,
        resetPassword,
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
            showAlert("Error", "Please fill in all fields");
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
                showAlert("Error", `${result.error}${errorDetails}`);
            } else if (
                result.needsVerification ||
                (result.success && !isLogin)
            ) {
                // Show verification message
                showAlert(
                    "Verification Required",
                    "A verification code has been sent to your email. Please verify your account."
                );
                setShowVerification(true);
            }
        } catch (error) {
            showAlert("Error", error.message);
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

    // Handle forgot password button click
    const handleForgotPassword = () => {
        setIsPasswordReset(true);
        setResetStep(1);
        setResetCode("");
        setNewPassword("");
        setConfirmPassword("");
    };

    // Handle back from password reset
    const handleBackFromReset = () => {
        setIsPasswordReset(false);
        setResetStep(1);
    };

    // Handle request password reset
    const handleRequestReset = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            const result = await requestPasswordReset(email);
            if (result.success) {
                setResetStep(2);
                Alert.alert(
                    "Check Your Email",
                    "If an account exists with this email, you will receive a password reset code."
                );
            } else {
                Alert.alert("Error", result.error);
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle confirm password reset
    const handleConfirmReset = async () => {
        if (!resetCode) {
            Alert.alert("Error", "Please enter the reset code");
            return;
        }

        if (!newPassword) {
            Alert.alert("Error", "Please enter a new password");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const result = await resetPassword(email, resetCode, newPassword);
            if (result.success) {
                Alert.alert(
                    "Success",
                    "Your password has been reset successfully"
                );
                setIsPasswordReset(false);
                setIsLogin(true);
                setPassword("");
            } else {
                Alert.alert("Error", result.error);
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    if (showVerification) {
        return <VerifyEmailScreen onBack={handleBackFromVerification} />;
    }

    // Password Reset UI
    if (isPasswordReset) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formContainer}>
                        <View style={styles.form}>
                            <Text style={styles.title}>
                                {resetStep === 1
                                    ? "Reset Password"
                                    : "Enter Reset Code"}
                            </Text>

                            {resetStep === 1 ? (
                                // Step 1: Enter email
                                <>
                                    <Text style={styles.instructions}>
                                        Enter your email address and we'll send
                                        you a code to reset your password.
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />

                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            loading && styles.buttonDisabled,
                                        ]}
                                        onPress={handleRequestReset}
                                        disabled={loading}
                                    >
                                        <Text style={styles.buttonText}>
                                            {loading
                                                ? "Sending..."
                                                : "Send Reset Code"}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                // Step 2: Enter code and new password
                                <>
                                    <Text style={styles.instructions}>
                                        Enter the code sent to your email and
                                        your new password.
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Reset Code"
                                        value={resetCode}
                                        onChangeText={setResetCode}
                                        autoCapitalize="none"
                                    />
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showNewPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() =>
                                                setShowNewPassword(
                                                    !showNewPassword
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name={
                                                    showNewPassword
                                                        ? "eye-off"
                                                        : "eye"
                                                }
                                                size={24}
                                                color="#4CAF50"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Confirm New Password"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={
                                                !showConfirmPassword
                                            }
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name={
                                                    showConfirmPassword
                                                        ? "eye-off"
                                                        : "eye"
                                                }
                                                size={24}
                                                color="#4CAF50"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            loading && styles.buttonDisabled,
                                        ]}
                                        onPress={handleConfirmReset}
                                        disabled={loading}
                                    >
                                        <Text style={styles.buttonText}>
                                            {loading
                                                ? "Resetting..."
                                                : "Reset Password"}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            <TouchableOpacity
                                style={styles.switchButton}
                                onPress={handleBackFromReset}
                            >
                                <Text style={styles.switchButtonText}>
                                    Back to Login
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    // Login/Register UI
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

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={24}
                                    color="#4CAF50"
                                />
                            </TouchableOpacity>
                        </View>

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

                        {isLogin && (
                            <TouchableOpacity
                                style={styles.forgotButton}
                                onPress={handleForgotPassword}
                            >
                                <Text style={styles.forgotButtonText}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        )}

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
        marginBottom: 30,
        textAlign: "center",
        color: "#333",
    },
    instructions: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
        color: "#666",
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
    passwordContainer: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        marginBottom: 20,
        alignItems: "center",
    },
    passwordInput: {
        flex: 1,
        padding: 15,
        fontSize: 16,
        backgroundColor: "transparent",
        ...(isWeb && {
            outline: "none",
        }),
    },
    eyeButton: {
        padding: 10,
        ...(isWeb && {
            cursor: "pointer",
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
    forgotButton: {
        marginTop: 15,
        alignItems: "center",
        ...(isWeb && {
            cursor: "pointer",
        }),
    },
    forgotButtonText: {
        color: "#4CAF50",
        fontSize: 16,
        ...(isWeb && {
            transition: "color 0.3s",
        }),
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
