# EcoSnap: AI-Powered Waste Classification App

EcoSnap is a mobile application that helps users properly classify waste items using AI vision technology. By simply taking a photo or selecting an image, users can instantly determine whether an item is recyclable, compostable, or destined for landfill.

## Download the App


- Download for Android - <https://ln5.sync.com/dl/13dcef950#qi6xzxg4-un83d82d-sfkbm6rk-a6vz8qj6>

- web - <https://ecosnapreactnativeexpo.netlify.app/>

## Features

-   📸 Take photos or select images from gallery
-   🤖 AI-powered waste classification
-   📋 Detailed disposal instructions
-   💾 History of previous classifications
-   ♻️ Color-coded waste categories
-   📱 Cross-platform (iOS & Android)

## Tech Stack

-   React Native with Expo
-   Node.js & Express backend
-   MongoDB for data storage
-   LLaMA Vision AI for image classification
-   Imgur/FreeImageHost for image hosting

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn
-   Expo CLI
-   MongoDB account
-   OpenRouter API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/EcoSnapReactNativeExpo.git
cd EcoSnapReactNativeExpo
```

2. Install dependencies:

```bash
npm install
cd backend
npm install
```

3. Configure environment variables:

    - Create `.env` in backend directory
    - Add required API keys and configuration

4. Start the development servers:

```bash
# Start backend server
cd backend
npm start

# Start Expo development server
cd ..
npx expo start
```

## Environment Variables

Backend `.env`:

```
MONGODB_URI=your_mongodb_uri
IMGUR_CLIENT_ID=your_imgur_client_id
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=4000
```

## Features in Detail

### Image Classification

-   Uses LLaMA Vision AI for accurate waste classification
-   Provides detailed disposal instructions
-   Supports both camera and gallery images

### History Tracking

-   Stores classification history with timestamps
-   Color-coded results for easy identification
-   Pull-to-refresh functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

-   LLaMA Vision AI for image classification
-   Expo team for the amazing mobile development framework
-   MongoDB for database services
-   OpenRouter for AI API services
