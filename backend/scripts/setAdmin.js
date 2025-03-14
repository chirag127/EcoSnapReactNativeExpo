import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const setAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const adminEmail = "whyiswhen@gmail.com";
        
        const user = await User.findOne({ email: adminEmail });
        
        if (!user) {
            console.log(`User with email ${adminEmail} not found`);
            process.exit(1);
        }
        
        user.isAdmin = true;
        await user.save();
        
        console.log(`User ${adminEmail} is now an admin`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

setAdmin();