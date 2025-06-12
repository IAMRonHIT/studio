'use server';
/**
 * @fileOverview A Genkit flow for performing deep research using a multi-query strategy.
 * It generates sub-queries, uses Brave Search and Summarizer tools for each,
 * and then synthesizes a final report.
 */

import { ai } from '@/ai/genkit';
// import { defineFlow, type Flow } from '@genkit-ai/flow'; // Incorrect: Use ai.defineFlow
import { z } from 'genkit';
import { braveWebSearch, type WebSearchOutput } from '@/ai/tools/performWebSearchTool';
import { braveSummarize, type BraveSummarizeOutput } from '@/ai/tools/braveSummarizeTool';
import {
  DeepResearchInputSchema,
  DeepResearchOutputSchema,
  type DeepResearchInput,
  type DeepResearchOutput,
} from '@/ai/flows/deep-research-flow'; // Reusing existing schemas

// Define a schema for the sub-query generation output
const SubQueriesSchema = z.object({
  subQueries: z.array(z.string()).describe('List of 10 specific sub-queries related to the original query.'),
});

// Define a schema for individual search/summary result
const SubQueryResultSchema = z.object({
  subQuery: z.string(),
  searchResults: z.custom<WebSearchOutput['results']>(),
  summary: z.custom<BraveSummarizeOutput | null>(),
  error: z.string().optional(),
});
type SubQueryResult = z.infer<typeof SubQueryResultSchema>;

// The explicit Flow type might not be necessary if ai.defineFlow infers it correctly.
// If Flow type is needed, it might be ai.Flow or from another genkit path.
// For now, let's rely on inference.
export const deepResearchMultiQueryFlow = ai.defineFlow(
  {
    name: 'deepResearchMultiQueryFlow',
    inputSchema: DeepResearchInputSchema,
    outputSchema: DeepResearchOutputSchema,
  },
  async (input: DeepResearchInput): Promise<DeepResearchOutput> => {
    const originalQuery = input.query;
    let allCollectedInfo: SubQueryResult[] = [];
    let finalReport: DeepResearchOutput = {
      summary: '',
      keyPoints: [],
      sources: [],
    };

    try {
      // Step 1: Generate Sub-Queries
      const subQueryGenerationPrompt = `Based on the original research query "${originalQuery}", generate exactly 10 distinct and specific sub-queries. These sub-queries should explore various facets, perspectives, and key aspects of the original topic. Each sub-query should be phrased as a question suitable for a web search. Return them as a JSON object with a key "subQueries" containing a list of strings.`;
      
      const subQueryResponse = await ai.generate({
        prompt: subQueryGenerationPrompt,
        model: 'googleai/gemini-2.5-pro-preview-05-06', // Or another suitable model
        output: { schema: SubQueriesSchema, format: 'json' },
        config: { temperature: 0.5 },
      });

      const subQueries = subQueryResponse.output?.subQueries;
      if (!subQueries || subQueries.length === 0) {
        console.error('Failed to generate sub-queries.');
        return {
          summary: 'Failed to generate sub-queries for the research topic. Please try a different query.',
          keyPoints: [],
          sources: [],
        };
      }

      // Step 2: Iterative Research for each sub-query
      for (const subQuery of subQueries.slice(0, 10)) { // Ensure only 10 are processed
        let queryResult: SubQueryResult = { subQuery, searchResults: [], summary: null };
        try {
          console.log(`Performing web search for sub-query: "${subQuery}"`);
          const searchOutput = await braveWebSearch({ query: subQuery });

          if (searchOutput.error) {
            console.warn(`Error searching for "${subQuery}": ${searchOutput.error}`);
            queryResult.error = `Search error: ${searchOutput.error}`;
          } else {
            queryResult.searchResults = searchOutput.results;
            if (searchOutput.summarizer_key) {
              console.log(`Summarizing content for sub-query: "${subQuery}" with key: ${searchOutput.summarizer_key}`);
              const summaryOutput = await braveSummarize({ summarizer_key: searchOutput.summarizer_key });
              if (summaryOutput.error) {
                console.warn(`Error summarizing for "${subQuery}": ${summaryOutput.error}`);
                queryResult.error = queryResult.error ? `${queryResult.error}; Summary error: ${summaryOutput.error}` : `Summary error: ${summaryOutput.error}`;
              } else {
                queryResult.summary = summaryOutput;
              }
            }
          }
        } catch (e: any) {
          console.error(`Exception during research for sub-query "${subQuery}":`, e);
          queryResult.error = `Exception: ${e.message}`;
        }
        allCollectedInfo.push(queryResult);
      }

      // Step 3: Synthesize Final Report
      const synthesisPrompt = `
        You are an AI research report writer. Based on the following collected information from multiple sub-queries related to the original topic "${originalQuery}", synthesize a comprehensive research report.
        The collected information includes search results and summaries for various sub-queries. Some may have encountered errors.

        Collected data:
        ${JSON.stringify(allCollectedInfo, null, 2)}

        Your report must include:
        1.  **Summary**: A detailed overview that integrates findings from all successful sub-queries. If some sub-queries failed or yielded no information, briefly mention this limitation.
        2.  **Key Points**: A list of the most important insights, facts, or takeaways discovered.
        3.  **Sources**: A list of credible sources (titles and URLs) obtained from the web searches. Prioritize citing sources that contributed to the key points and summary.

        Ensure your final output strictly adheres to the JSON schema with keys "summary" (string), "keyPoints" (array of strings), and "sources" (array of objects with "title" and optional "url").
      `;

      const reportResponse = await ai.generate({
        prompt: synthesisPrompt,
        model: 'googleai/gemini-2.5-pro-preview-05-06', // Or another suitable model for synthesis
        output: { schema: DeepResearchOutputSchema, format: 'json' },
        config: { temperature: 0.7 },
      });

      finalReport = reportResponse.output || {
        summary: 'Failed to synthesize the final research report.',
        keyPoints: [],
        sources: [],
      };

    } catch (flowError: any) {
      console.error('Error in deepResearchMultiQueryFlow:', flowError);
      finalReport = {
        summary: `An error occurred during the deep research process: ${flowError.message}`,
        keyPoints: [],
        sources: [],
      };
    }
    
    return finalReport;
  }
);

// Export a runner function for easier invocation if needed, though flows are often called directly.
export async function runDeepResearchMultiQueryFlow(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchMultiQueryFlow(input);
}
