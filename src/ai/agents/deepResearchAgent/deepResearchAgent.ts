'use server';
/**
 * @fileOverview A Genkit prompt-based "agent" that uses the deepResearchMultiQueryFlow
 * to perform in-depth research.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit'; // For defining prompt schemas
import { deepResearchMultiQueryFlow } from '@/ai/flows/deepResearchMultiQueryFlow';
import {
  DeepResearchInputSchema, // z.object({ query: z.string() })
  DeepResearchOutputSchema,
  type DeepResearchInput,
  type DeepResearchOutput,
} from '@/ai/flows/deep-research-flow'; // Reusing existing schemas

// Exporting types for external use if needed
export type { DeepResearchInput, DeepResearchOutput };

const deepResearchAgentSystemPrompt = `
You are a helpful research assistant.
Your task is to take the user's research query and use the 'deepResearchMultiQueryFlow' tool to conduct comprehensive research.
After the tool finishes and provides the research report (summary, key points, sources), present this report directly to the user as your answer.
Ensure your output strictly matches the structure of the research report provided by the tool.
If the tool indicates an error in its output (e.g., in the summary field), convey that error information clearly.
User's research query: {{{query}}}
`;

// Define the prompt-based agent
export const deepResearchAgentPromptAction = ai.definePrompt(
  {
    name: 'deepResearchAgent', // Name of this prompt/agent
    model: 'googleai/gemini-2.5-pro-preview-05-06', // Can be a simpler/faster model if it's just calling a tool
    tools: [deepResearchMultiQueryFlow], // The flow is a tool for this agent
    input: { schema: DeepResearchInputSchema },
    output: { schema: DeepResearchOutputSchema }, // Expects to output what the flow outputs
    prompt: deepResearchAgentSystemPrompt,
    config: { temperature: 0.3 }, // Lower temperature as it's mainly orchestrating
  }
);

// Runner function for this prompt-based agent
export async function runDeepResearchAgent(
  input: DeepResearchInput
): Promise<DeepResearchOutput> {
  const response = await deepResearchAgentPromptAction(input);
  const output = response.output; // Corrected: access as a property

  if (!output) {
    console.error('Deep Research Agent (prompt-based) returned undefined/null output.');
    return {
      summary: 'The Deep Research Agent was unable to produce a result using the research flow.',
      keyPoints: [],
      sources: [],
    };
  }
  return output;
}
