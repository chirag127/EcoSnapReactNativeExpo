import dotenv from 'dotenv';
import { classifyImageWithNvidia } from './services/aiService.js';

dotenv.config();

// Path to a test image file
const testImagePath = 'C:\\AM\\Github\\EcoSnapReactNativeExpo\\frontend\\assets\\favicon.png'; // Make sure this file exists

// Test the NVIDIA API integration
const testNvidiaApi = async () => {
  try {
    console.log('Testing NVIDIA API integration...');

    if (!process.env.NVIDIA_API_KEY) {
      console.error('NVIDIA_API_KEY is not set in .env file');
      process.exit(1);
    }

    const result = await classifyImageWithNvidia(
      testImagePath,
      'What is in this image? Classify as recyclable, compostable, or landfill.'
    );

    console.log('NVIDIA API Test Result:');
    console.log(result);
    console.log('NVIDIA API integration test completed successfully!');

  } catch (error) {
    console.error('NVIDIA API Test Error:', error.message);
    process.exit(1);
  }
};

testNvidiaApi();
