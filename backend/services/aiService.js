import axios from "axios";
import { readFile } from "node:fs/promises";
// const Groq = require('groq-sdk');
// import { Groq } from "groq-sdk";

// const groq = new Groq();

/**
 * Classify an image using NVIDIA API as a backup option
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Custom prompt for classification
 * @returns {Promise<string>} - Classification result
 */
export const classifyImageWithNvidia = async (imagePath, prompt) => {
    try {
        console.log("Classifying image with NVIDIA API:", imagePath);
        console.log("Prompt:", prompt);

        // Read the image file
        const data = await readFile(imagePath);
        const imageB64 = Buffer.from(data).toString("base64");

        if (imageB64.length > 180_000) {
            throw new Error("Image too large for direct upload to NVIDIA API");
        }

        const defaultPrompt =
            "What is in this image? Classify as recyclable, compostable, or landfill. And provide proper disposal instructions";
        const userPrompt = prompt || defaultPrompt;

        const payload = {
            model: "meta/llama-3.2-90b-vision-instruct",
            messages: [
                {
                    role: "user",
                    content: `${userPrompt} <img src="data:image/png;base64,${imageB64}" />`,
                },
            ],
            max_tokens: 512,
            temperature: 1.0,
            top_p: 1.0,
            stream: false,
        };

        const headers = {
            Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
            Accept: "application/json",
        };

        const response = await axios.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            payload,
            { headers: headers }
        );

        console.log("NVIDIA AI response:", response.data);

        if (
            !response.data ||
            !response.data.choices ||
            response.data.choices.length === 0
        ) {
            throw new Error("Invalid NVIDIA AI response");
        }

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("NVIDIA Classification error:", error);
        throw new Error(
            `Failed to classify image with NVIDIA: ${error.message}`
        );
    }
};

/**
 * Classify an image using OpenRouter API with NVIDIA as fallback
 * @param {string} imageUrl - URL of the image to classify
 * @param {string} prompt - Custom prompt for classification
 * @returns {Promise<string>} - Classification result
 */
export const classifyImage = async (imageUrl, prompt) => {
    try {
        console.log("Classifying image:", imageUrl);
        console.log("Prompt:", prompt);

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "meta-llama/llama-3.2-90b-vision-instruct",
                // model:"x-ai/grok-vision-beta",

                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text:
                                    prompt ||
                                    "What is in this image? Classify as recyclable, compostable, or landfill. And provide proper disposal instructions",
                            },
                            { type: "image_url", image_url: { url: imageUrl } },
                        ],
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    // "HTTP-Referer": process.env.APP_URL,
                    // "X-Title": "EcoSnap",
                },
            }
        );

        console.log("AI response:", response.data);

        if (
            !response.data ||
            !response.data.choices ||
            response.data.choices.length === 0
        ) {
            throw new Error("Invalid AI response");
        }

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("OpenRouter Classification error:", error);

        // If we have a local image path and NVIDIA API key, try using NVIDIA as fallback
        if (process.env.NVIDIA_API_KEY && imageUrl.startsWith("file://")) {
            console.log("Attempting fallback to NVIDIA API...");
            try {
                // Convert file:// URL to local path
                const localPath = imageUrl.replace("file://", "");
                return await classifyImageWithNvidia(localPath, prompt);
            } catch (nvidiaError) {
                console.error("NVIDIA fallback also failed:", nvidiaError);
                throw new Error("All classification attempts failed");
            }
        }

        throw new Error("Failed to classify image");
    }
};
