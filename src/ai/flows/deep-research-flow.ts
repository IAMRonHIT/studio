
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
import { braveWebSearch } from '@/ai/tools/performWebSearchTool';
import {
  DeepResearchInputSchema,
  DeepResearchOutputSchema,
  type DeepResearchInput,
  type DeepResearchOutput,
} from './deep-research-schemas';
import { braveSummarize } from '@/ai/tools/braveSummarizeTool';
import { fdaTools } from '@/ai/tools/fda-drug-label-tools';
import { eUtilitiesApplicationsTool } from '@/ai/tools/e-utilities-tool';

export async function performDeepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepResearchPrompt',
  model: 'googleai/gemini-2.5-pro-preview-05-06',
  input: {schema: DeepResearchInputSchema},
  output: {schema: DeepResearchOutputSchema},
  config: { maxOutputTokens: 60000 },
  tools: [braveWebSearch, braveSummarize, ...fdaTools, eUtilitiesApplicationsTool],
  prompt: `You are a highly sophisticated AI research assistant specializing in healthcare topics.
Your goal is to conduct in-depth research on the following query.

**To ensure your information is current and comprehensive, you MUST first use the "braveWebSearch" tool to find relevant articles, studies, and guidelines from the internet.**
The "braveWebSearch" tool may return a "summarizer_key".
**If a "summarizer_key" is returned, you MUST then use the "braveSummarize" tool with this key to obtain a summary of the search results.**

Synthesize the information from your internal knowledge, the results from the "braveWebSearch" tool, AND the summary from the "braveSummarize" tool (if available).

If the "braveWebSearch" tool returns an error message (e.g., indicating it's not configured or failed), clearly state this limitation in your summary and attempt to answer based on your internal knowledge if possible, noting that web search was unavailable.
If the "braveSummarize" tool returns an error or no summary, proceed with the information from "braveWebSearch" and your internal knowledge, noting that a summary could not be obtained.

Provide a comprehensive summary, detail the key findings, and list credible sources with their URLs as found through your searches using the "braveWebSearch" tool and mentioned in the summary from "braveSummarize".
Prioritize citing sources and URLs obtained from these tools.
Consider using the FDA drug label tools (e.g., 'searchDrugLabel', 'getDrugInteractions', 'getAdverseReactions') if the query involves specific medications.
Consider using the 'e_utilities_applications' tool (for PubMed searches, etc.) if the query requires information from biomedical literature databases.
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
