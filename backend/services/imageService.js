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
