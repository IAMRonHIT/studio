
import { config } from 'dotenv';
config();

// Import agents
import '@/ai/agents/triageAgent';
import '@/ai/agents/codeCompletionAgent';

// Import other flows (to be refactored into agents later)
import '@/ai/flows/generate-image-flow.ts';
import '@/ai/flows/deep-research-flow.ts';
