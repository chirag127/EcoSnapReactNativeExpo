import axios from 'axios';
import FormData from 'form-data';

export const uploadToImgur = async (base64Image) => {
  try {
    const response = await axios.post('https://api.imgur.com/3/image', {
      image: base64Image,
      type: 'base64'
    }, {
      headers: {
        'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`
      }
    });
    return response.data.data.link;
  } catch (error) {
    throw new Error('Failed to upload image to Imgur');
  }
};
