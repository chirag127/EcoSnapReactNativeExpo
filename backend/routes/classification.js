import express from "express";
import { uploadToFreeImageHost } from "../services/imageService.js";
import { classifyImage } from "../services/aiService.js";
import Classification from "../models/Classification.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/classify", auth, async (req, res) => {
    try {
        const image = req.body.image;
        const prompt =
            req.body.prompt ||
            "What is in this image? Classify as recyclable, compostable, or landfill. And provide proper disposal instructions";
        const imageUrl = await uploadToFreeImageHost(image);
        const response = await classifyImage(imageUrl, prompt);

        const result = await Classification.create({
            imageUrl,
            response,
            prompt,
            user: req.user._id,
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/history", auth, async (req, res) => {
    try {
        const history = await Classification.find({ user: req.user._id })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
