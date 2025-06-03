
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-tool-selector.ts';
import '@/ai/flows/ai-code-completion.ts';
import '@/ai/flows/generate-image-flow.ts';
import '@/ai/flows/deep-research-flow.ts';
// Removed import for web-search-tool.ts
