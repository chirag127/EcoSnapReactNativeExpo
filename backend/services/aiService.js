import axios from "axios";

export const classifyImage = async (imageUrl) => {
    try {
        console.log("Classifying image:", imageUrl);
        // Compress the image before sending it to the AI model
        // const compressedImage = await compressImage(imageUrl);
        // const formData = new FormData();
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "meta-llama/llama-3.2-90b-vision-instruct",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "What is in this image? Classify as recyclable, compostable, or landfill. And provide proper disposal instructions",
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
                    "X-Title": "EcoSnap",
                },
            }
        );

        console.log("AI response:", response);

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Classification error:", error);
        throw new Error("Failed to classify image");
    }
};
