import axios from "axios";
const cloudinary = require("cloudinary").v2;
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
    let imageData = image;


    const IMGUR_CLIENT_ID = "869f294e59431cd";

    let response;
    let imgurUrl;

    try {
        response = await axios({
            method: "post",
            url: "https://api.imgur.com/3/image",
            data: {
                image: imageData,
            },
            headers: {
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            },
        });
    } catch (error) {
        console.error("Error uploading image to Imgur:", error.message);
        throw error;
    }

    imgurUrl = response.data.data.link;

    console.log("Image URL:", imgurUrl);

    return imgurUrl;
};
