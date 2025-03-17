import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../services/emailService.js";
import crypto from "crypto";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Generate verification code
        const verificationCode = crypto.randomBytes(3).toString("hex");
        const verificationCodeExpires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ); // 24 hours

        // Create new user
        const user = new User({
            email,
            password,
            name,
            verificationCode,
            verificationCodeExpires,
        });
        await user.save();

        // Send verification email
        const verificationEmailHtml = `
            <h1>Welcome to EcoSnap!</h1>
            <p>Thank you for registering. Please verify your email address by entering the following code in the app:</p>
            <h2 style="color: #4CAF50; font-size: 24px;">${verificationCode}</h2>
            <p>This code will expire in 24 hours.</p>
        `;

        // Try to send email but continue even if it fails
        const emailSent = await sendEmail(
            email,
            "Verify Your EcoSnap Account",
            verificationEmailHtml
        );

        if (!emailSent) {
            console.log(
                `Failed to send verification email to ${email}, but continuing with registration`
            );
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified,
            },
            message: "Verification code sent to your email",
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(400).json({
            error: error.message || "Registration failed",
            details: error.toString(),
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check if email is verified
        if (!user.isVerified) {
            // Generate new verification code if needed
            if (
                !user.verificationCode ||
                !user.verificationCodeExpires ||
                user.verificationCodeExpires < Date.now()
            ) {
                user.verificationCode = crypto.randomBytes(3).toString("hex");
                user.verificationCodeExpires = new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ); // 24 hours
                await user.save();

                // Send verification email
                const verificationEmailHtml = `
                    <h1>EcoSnap Email Verification</h1>
                    <p>Please verify your email address by entering the following code in the app:</p>
                    <h2 style="color: #4CAF50; font-size: 24px;">${user.verificationCode}</h2>
                    <p>This code will expire in 24 hours.</p>
                `;

                // Try to send email but continue even if it fails
                const emailSent = await sendEmail(
                    email,
                    "Verify Your EcoSnap Account",
                    verificationEmailHtml
                );

                if (!emailSent) {
                    console.log(
                        `Failed to send verification email to ${email} during login, but continuing`
                    );
                }
            }

            return res.status(403).json({
                error: "Email not verified",
                needsVerification: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    isVerified: false,
                },
            });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Verify email
router.post("/verify-email", async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Find user
        const user = await User.findOne({
            email,
            verificationCode,
            verificationCodeExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ error: "Invalid or expired verification code" });
        }

        // Update user
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified,
            },
            message: "Email verified successfully",
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Resend verification code
router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }

        // Generate new verification code
        const verificationCode = crypto.randomBytes(3).toString("hex");
        const verificationCodeExpires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ); // 24 hours

        // Update user
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        await user.save();

        // Send verification email
        const verificationEmailHtml = `
            <h1>EcoSnap Email Verification</h1>
            <p>Please verify your email address by entering the following code in the app:</p>
            <h2 style="color: #4CAF50; font-size: 24px;">${verificationCode}</h2>
            <p>This code will expire in 24 hours.</p>
        `;

        // Try to send email but continue even if it fails
        const emailSent = await sendEmail(
            email,
            "Verify Your EcoSnap Account",
            verificationEmailHtml
        );

        if (!emailSent) {
            console.log(
                `Failed to send verification email to ${email} during resend, but continuing`
            );
        }

        res.json({ message: "Verification code resent" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Test route to check if server is running
router.get("/test", (req, res) => {
    res.json({ message: "Auth server is running correctly" });
});

export default router;
