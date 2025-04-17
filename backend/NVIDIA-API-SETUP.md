# NVIDIA API Integration for EcoSnap

This document explains how to set up and use the NVIDIA API as a backup option for image classification in EcoSnap.

## Setup Instructions

1. **Get an NVIDIA API Key**
   - Sign up for an NVIDIA API account at [NVIDIA Developer Portal](https://developer.nvidia.com/)
   - Create a new API key for the NVIDIA AI Foundation Models

2. **Configure Environment Variables**
   - Add your NVIDIA API key to the `.env` file in the backend directory:
     ```
     NVIDIA_API_KEY=your_nvidia_api_key
     ```

3. **Test the Integration**
   - Place a test image in the backend directory named `test-image.png`
   - Run the test script:
     ```
     node test-nvidia-api.js
     ```
   - If successful, you should see the classification result in the console

## How It Works

The NVIDIA API integration serves as a backup option when the primary OpenRouter API fails. The system will:

1. First attempt to classify the image using OpenRouter API
2. If that fails and the image is available locally (file:// URL), it will automatically fall back to the NVIDIA API
3. If both attempts fail, an error will be thrown

## API Usage Notes

- The NVIDIA API requires base64-encoded images
- There is a size limit of 180,000 bytes for direct base64 encoding
- For larger images, consider resizing before sending to the API
- The API uses the same model (Llama 3.2 90B Vision) as the primary service

## Troubleshooting

If you encounter issues with the NVIDIA API integration:

1. Verify your API key is correct and active
2. Check that the image file exists and is accessible
3. Ensure the image is in a supported format (PNG, JPEG)
4. Check the console logs for specific error messages

For more information, refer to the [NVIDIA API Documentation](https://developer.nvidia.com/docs).
