import express from "express";
import Prompt from "../models/Prompt.js";
const router = express.Router();

const defaultPrompts = [
    {
        id: "1",
        label: "Recycling Guide",
        value: "What is in this image? Classify as recyclable, compostable, or landfill. And provide proper disposal instructions",
    },
    // Describe this outfit and suggest styling tips.
    {
        id: "2",
        label: "Outfit Description",
        value: "Describe this outfit and suggest styling tips.",
    },
    // What is the brand and model of this item?
    {
        id: "3",
        label: "Material Analysis",
        value: "What materials is this item made of and how eco-friendly are they?",
    },
    {
        id: "4",
        label: "Environmental Impact",
        value: "What is the environmental impact of this item?",
    },
    // Recognizes landmarks historical facts, fun trivia, and nearby points of interest
    {
        id: "5",
        label: "Landmark Recognition",
        value: "Recognize landmarks and provide historical facts, fun trivia, and nearby points of interest.",

    },
    // What food items are in this image? Provide estimated nutrition facts.
    {
        id: "6",
        label: "Food Recognition",
        value: "What food items are in this image? Provide estimated nutrition facts.",
    },
    // What is the brand and model of this item?
    {
        id: "7",
        label: "Brand Recognition",
        value: "What is the brand and model of this item?",
    },
    // What plant is in this image? Identify any disease or pest.What plant is in this image? Identify any disease or pest.
    {
        id: "8",
        label: "Plant Recognition",
        value: "What plant is in this image? Identify any disease or pest.",
    },
    // What animal is in this image? Provide fun facts.
    {
        id: "9",
        label: "Animal Recognition",
        value: "What animal is in this image? Provide fun facts.",
    },
    // What is the breed of this dog? Provide fun facts.
    {
        id: "10",
        label: "Dog Breed Recognition",
        value: "What is the breed of this dog? Provide fun facts.",
    },

];

router.get("/", async (req, res) => {
    try {
        const prompts = await Prompt.find();
        // If no prompts exist, initialize with default prompts
        if (prompts.length === 0) {
            await Prompt.insertMany(defaultPrompts);
            return res.json(defaultPrompts);
        }
        res.json(prompts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { label, value } = req.body;
        const newPrompt = await Prompt.create({
            label,
            value
        });
        res.status(201).json(newPrompt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const prompt = await Prompt.findByIdAndDelete(req.params.id);
        if (!prompt) {
            return res.status(404).json({ error: "Prompt not found" });
        }
        res.json({ message: "Prompt deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new PUT route for editing prompts
router.put("/:id", async (req, res) => {
    try {
        const { label, value } = req.body;
        const updatedPrompt = await Prompt.findByIdAndUpdate(
            req.params.id,
            { label, value },
            { new: true } // Returns the updated document
        );

        if (!updatedPrompt) {
            return res.status(404).json({ error: "Prompt not found" });
        }

        res.json(updatedPrompt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
