
'use server';
/**
 * @fileOverview A Genkit flow for performing deep research on a given query,
 * potentially using web search tools.
 *
 * - performDeepResearch - A function that takes a query and returns a research summary, key points, and sources.
 * - DeepResearchInput - The input type for the performDeepResearch function.
 * - DeepResearchOutput - The return type for the performDeepResearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchWebTool } from '@/ai/tools/web-search-tool'; // Import the new tool

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
      url: z.string().optional().describe('The URL of the source, if available. Prioritize sources found via web search.')
    })
  ).optional().describe('A list of sources used for the research, including those identified by the AI or found through web searches.')
});
export type DeepResearchOutput = z.infer<typeof DeepResearchOutputSchema>;

export async function performDeepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepResearchPrompt',
  input: {schema: DeepResearchInputSchema},
  output: {schema: DeepResearchOutputSchema},
  tools: [searchWebTool], // Make the tool available to the LLM
  prompt: `You are a highly sophisticated AI research assistant specializing in healthcare topics.
Your goal is to conduct in-depth research on the following query.

**You MUST use the 'searchWebTool' to find current and relevant information from the internet to answer the query.**
You may use the 'searchWebTool' multiple times if necessary to gather comprehensive information on different aspects of the query.
Synthesize the information from your internal knowledge AND the results from your web searches using the 'searchWebTool'.

Provide a comprehensive summary, detail the key findings, and list credible sources.
When listing sources, prioritize those identified through the 'searchWebTool' if they are relevant and provide URLs if the tool returns them.

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
    const {output} = await prompt(input); // The LLM will decide if/when to call searchWebTool
    if (!output) {
      throw new Error("The AI failed to provide research output after attempting to use tools.");
    }
    return output;
  }
);
