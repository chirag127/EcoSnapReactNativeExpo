import axios from "axios";
// const Groq = require('groq-sdk');
// import { Groq } from "groq-sdk";

// const groq = new Groq();

export const classifyImage = async (imageUrl,prompt) => {
    try {
        console.log("Classifying image:", imageUrl);

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
                                text: prompt || "What is in this image? Classify as recyclable, compostable, or landfill. And provide proper disposal instructions",
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

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "What is in this image? Classify as recyclable, compostable, or landfill. And provide proper disposal instructions",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                },
            ],
            model: "llama-3.2-11b-vision-preview",
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null,
        });

        console.log(chatCompletion.choices[0].message.content);

        return chatCompletion.choices[0].message.content;

        // Check if the response contains valid data
    } catch (error) {
        console.error("Classification error:", error);
        throw new Error("Failed to classify image");
    }
};
