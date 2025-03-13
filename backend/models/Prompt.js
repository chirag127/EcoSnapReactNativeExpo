import mongoose from "mongoose";

const PromptSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    }
});

export default mongoose.model("Prompt", PromptSchema);