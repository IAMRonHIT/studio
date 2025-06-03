
import { config } from 'dotenv';
config();

// Import agents
import '@/ai/agents/triageAgent';
import '@/ai/agents/codeCompletionAgent';

// Import tools
import '@/ai/tools/web-search-tool'; // Make sure this tool is registered

// Import other flows (to be refactored into agents later or used directly)
import '@/ai/flows/generate-image-flow.ts';
import '@/ai/flows/deep-research-flow.ts';
