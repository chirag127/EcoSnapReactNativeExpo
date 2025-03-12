import express from "express";
import {
    uploadToImgur,
    uploadToFreeImageHost,
} from "../services/imageService.js";
import { classifyImage } from "../services/aiService.js";
import Classification from "../models/Classification.js";

const router = express.Router();

router.post("/classify", async (req, res) => {
    try {
        const  image = req.body.image;
        const prompt = req.body.prompt || "What is in this image? Classify as recyclable, compostable, or landfill. And provide proper disposal instructions";
        const imageUrl = await uploadToFreeImageHost(image);
        const response = await classifyImage(imageUrl, prompt);

        const result = await Classification.create({
            imageUrl,
            response,
            prompt,
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
