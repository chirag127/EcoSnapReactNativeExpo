import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import classificationRoutes from "./routes/classification.js";

import promptsRouter from "./routes/prompts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST",`PUT`, `DELETE`],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        exposedHeaders: ["Access-Control-Allow-Origin"],
    })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api", classificationRoutes);
app.use("/api/prompts", promptsRouter);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server accessible at http://localhost:${PORT}`);
});
