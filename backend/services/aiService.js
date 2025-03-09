import axios from 'axios';

export const classifyImage = async (imageUrl) => {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "meta-llama/llama-3.2-90b-vision-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is in this image? Classify as recyclable, compostable, or landfill." },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.APP_URL,
        'X-Title': 'EcoSnap',
      }
    });

    const classification = response.data.choices[0].message.content;
    return {
      classification: parseClassification(classification),
      confidence: 0.9 // Mock confidence score
    };
  } catch (error) {
    throw new Error('Failed to classify image');
  }
};

const parseClassification = (text) => {
  const keywords = {
    recyclable: ['recyclable', 'recycle'],
    compostable: ['compostable', 'compost'],
    landfill: ['landfill', 'trash', 'waste']
  };

  text = text.toLowerCase();
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => text.includes(word))) {
      return category;
    }
  }
  return 'landfill'; // Default classification
};
