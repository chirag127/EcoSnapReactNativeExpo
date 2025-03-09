import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: "di0mvijee",
    api_key: "937372845829153",
    api_secret:
        "CLOUDINARY_URL=cloudinary://937372845829153:222sbPe3ZrkjVUbO7asNKfYd8ZI@di0mvijee",
});

// Function to upload image to Cloudinary
export const uploadToCloudinary = async (image) => {
    try {
        const result = await cloudinary.uploader.upload(image);
        // You can customize the folder option based on your needs

        // Return the public URL of the uploaded image
        imageUrl = result.secure_url;

        console.log("Image URL:", imageUrl);

        return imageUrl;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message);
        throw error;
    }
};

export const uploadToImgur = async (image) => {
    if (!image) {
        throw new Error("No image data provided");
    }

    try {
        const response = await axios({
            method: "post",
            url: "https://api.imgur.com/3/image",
            data: {
                image: image,
                type: "base64",
            },
            headers: {
                Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.data?.data?.link) {
            throw new Error("Invalid response from Imgur");
        }

        return response.data.data.link;
    } catch (error) {
        console.error(
            "Imgur upload error:",
            error.response?.data || error.message
        );
        throw new Error("Failed to upload image to Imgur");
    }
};
