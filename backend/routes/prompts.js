import express from "express";
const router = express.Router();

const defaultPrompts = [
    { id: "1", label: "Recycling Guide", value: "What is in this image? Classify as recyclable, compostable, or landfill. And provide proper disposal instructions" },
    { id: "2", label: "Material Analysis", value: "What materials is this item made of and how eco-friendly are they?" },
    { id: "3", label: "Environmental Impact", value: "What is the environmental impact of this item?" }
];

router.get("/", (req, res) => {
    try {
        res.json(defaultPrompts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
