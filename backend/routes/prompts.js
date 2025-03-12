import express from "express";
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
];

router.get("/", (req, res) => {
    try {
        res.json(defaultPrompts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
