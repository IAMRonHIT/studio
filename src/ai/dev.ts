
import { config } from 'dotenv';
config(); // Load .env variables

// Import agents
import '@/ai/agents/triageAgent';
import '@/ai/agents/codeCompletionAgent';

// Import tools
import '@/ai/tools/performWebSearchTool'; // If you still want this for other agents or direct use
import '@/ai/tools/fda-drug-label-tools';
import '@/ai/tools/npi-registry-tool';
import '@/ai/tools/e-utilities-tool';


// Import other flows (to be refactored into agents later or used directly)
import '@/ai/flows/generate-image-flow';
import '@/ai/flows/deep-research-flow'; // This might be superseded by Ron AI's capabilities
