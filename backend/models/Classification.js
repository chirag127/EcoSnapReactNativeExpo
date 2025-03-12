import mongoose from "mongoose";

const ClassificationSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        required: true,
    },
    prompt: {
        type: String,
        required: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Classification", ClassificationSchema);
