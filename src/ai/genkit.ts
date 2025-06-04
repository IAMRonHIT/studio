
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openAI} from '@genkit-ai/openai'; // Import the OpenAI plugin - Commented out due to install issues

// Ensure your OPENAI_API_KEY is set in your .env file
// Example: OPENAI_API_KEY=your_openai_api_key_here

export const ai = genkit({
  plugins: [
    googleAI(), // Keep Google AI for existing Gemini models (e.g., image generation)
    // openAI({ // Commented out due to install issues
    //   apiKey: process.env.OPENAI_API_KEY,
    // }), 
  ],
  // Set the fine-tuned model as the default for generation. - Commented out as OpenAI plugin is disabled
  // Prompts/flows can still specify other models if needed.
  // model: 'openai/ft:gpt-4.1-mini-2025-04-14:ron-health-information-technologies-inc:ron-ai:BZIF9O11',
});
