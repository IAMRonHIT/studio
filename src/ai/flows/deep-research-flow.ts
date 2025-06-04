
'use server';
/**
 * @fileOverview A Genkit flow for performing deep research on a given query,
 * leveraging a web search tool for current information.
 *
 * - performDeepResearch - A function that takes a query and returns a research summary, key points, and sources.
 * - DeepResearchInput - The input type for the performDeepResearch function.
 * - DeepResearchOutput - The return type for the performDeepResearch function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';
import { performWebSearchTool } from '@/ai/tools/performWebSearchTool';

const DeepResearchInputSchema = z.object({
  query: z.string().describe('The research topic or question.'),
});
export type DeepResearchInput = z.infer<typeof DeepResearchInputSchema>;

const DeepResearchOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the research findings, integrating information from internal knowledge and web searches.'),
  keyPoints: z.array(z.string()).describe('A list of key points or takeaways from the research.'),
  sources: z.array(
    z.object({
      title: z.string().describe('The title of the source material.'),
      url: z.string().optional().describe('The URL of the source, if available. Prioritize sources found via the performWebSearch tool.')
    })
  ).optional().describe('A list of sources used for the research, including those identified by the AI or found through web searches via the performWebSearch tool.')
});
export type DeepResearchOutput = z.infer<typeof DeepResearchOutputSchema>;

export async function performDeepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepResearchPrompt',
  model: 'googleai/gemini-1.5-flash-latest', // Fallback model
  input: {schema: DeepResearchInputSchema},
  output: {schema: DeepResearchOutputSchema},
  tools: [performWebSearchTool], 
  prompt: `You are a highly sophisticated AI research assistant specializing in healthcare topics.
Your goal is to conduct in-depth research on the following query.

**To ensure your information is current and comprehensive, you MUST use the "performWebSearch" tool to find relevant articles, studies, and guidelines from the internet.**
Synthesize the information from your internal knowledge AND the results from the "performWebSearch" tool.

Provide a comprehensive summary, detail the key findings, and list credible sources with their URLs as found through your searches using the "performWebSearch" tool.
Prioritize citing sources and URLs obtained from the "performWebSearch" tool.
Focus on accuracy, depth, and clarity. Ensure your output strictly adheres to the defined schema.

Query: {{{query}}}
`,
});

const deepResearchFlow = ai.defineFlow(
  {
    name: 'deepResearchFlow',
    inputSchema: DeepResearchInputSchema,
    outputSchema: DeepResearchOutputSchema,
  },
  async (input: DeepResearchInput) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to provide research output.");
    }
    return output;
  }
);

      
