import express from "express";
import { uploadToImgur } from "../services/imageService.js";
import { classifyImage } from "../services/aiService.js";
import Classification from "../models/Classification.js";

const router = express.Router();

router.post("/classify", async (req, res) => {
    try {
        if (!req.body || !req.body.image) {
            return res.status(400).json({ error: "No image data provided" });
        }

        const imageUrl = await uploadToImgur(req.body.image);

        if (!imageUrl) {
            return res.status(400).json({ error: "Failed to upload image" });
        }

        const response = await classifyImage(imageUrl);

        if (!response) {
            return res
                .status(400)
                .json({ error: "Failed to get classification" });
        }

        const result = await Classification.create({
            imageUrl,
            response,
        });

        res.json(result);
    } catch (error) {
        console.error("Classification error:", error);
        res.status(500).json({
            error: error.message || "Internal server error",
        });
    }
});

router.get("/history", async (req, res) => {
    try {
        const history = await Classification.find()
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
