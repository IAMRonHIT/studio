
'use server';
/**
 * @fileOverview A Genkit flow for performing deep research on a given query.
 *
 * - performDeepResearch - A function that takes a query and returns a research summary, key points, and sources.
 * - DeepResearchInput - The input type for the performDeepResearch function.
 * - DeepResearchOutput - The return type for the performDeepResearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeepResearchInputSchema = z.object({
  query: z.string().describe('The research topic or question.'),
});
export type DeepResearchInput = z.infer<typeof DeepResearchInputSchema>;

const DeepResearchOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the research findings.'),
  keyPoints: z.array(z.string()).describe('A list of key points or takeaways from the research.'),
  sources: z.array(
    z.object({
      title: z.string().describe('The title of the source material.'),
      url: z.string().optional().describe('The URL of the source, if available.')
    })
  ).optional().describe('A list of sources used for the research, if any were cited by the AI.')
});
export type DeepResearchOutput = z.infer<typeof DeepResearchOutputSchema>;

export async function performDeepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepResearchPrompt',
  input: {schema: DeepResearchInputSchema},
  output: {schema: DeepResearchOutputSchema},
  prompt: `You are a highly sophisticated AI research assistant. Your goal is to conduct in-depth research on the following query, synthesize the information, and provide a comprehensive summary, key findings, and if possible, a list of credible sources.

Focus on accuracy, depth, and clarity. Structure your output according to the defined schema, including a summary, an array of keyPoints, and an array of sources (each with a title and optional URL).

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
