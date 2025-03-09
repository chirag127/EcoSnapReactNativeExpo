import express from "express";
import { uploadToImgur, uploadToCloudinary } from "../services/imageService.js";
import { classifyImage } from "../services/aiService.js";
import Classification from "../models/Classification.js";

const router = express.Router();

router.post("/classify", async (req, res) => {
    try {
        const image = req.body.image; // Assuming the image is sent as a base64 string
        // const imageUrl = await uploadToCloudinary(image);
        const imageUrl = await uploadToImgur(image);
        const response = await classifyImage(imageUrl);

        const result = await Classification.create({
            imageUrl,
            response,
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
