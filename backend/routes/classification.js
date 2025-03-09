import express from 'express';
import { uploadToImgur } from '../services/imageService.js';
import { classifyImage } from '../services/aiService.js';
import Classification from '../models/Classification.js';

const router = express.Router();

router.post('/classify', async (req, res) => {
  try {
    const { image } = req.body;

    // Upload to Imgur
    const imageUrl = await uploadToImgur(image);

    // Classify with LLaMA Vision
    const { classification, confidence } = await classifyImage(imageUrl);

    // Save to MongoDB
    const result = await Classification.create({
      imageUrl,
      classification,
      confidence
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', async (req, res) => {
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
