import axios from "axios";

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


export const uploadToFreeImageHost = async (image) => {
    const api_key = "6d207e02198a847aa98d0a2a901485a5";
    const api_url = "https://freeimage.host/api/1/upload";
    const formData = new FormData();
    formData.append("key", api_key);
    formData.append("source", image);
    formData.append("action", "upload");
    formData.append("format", "json");

    try {
        const response = await axios.post(api_url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.status === 200) {
            return response.data.image.url;
        } else {
            throw new Error("Failed to upload image");
        }
    }
    catch (error) {
        console.error("Error uploading image:", error.message);
        throw error;
    }
}