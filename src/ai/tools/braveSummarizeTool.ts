/**
 * @fileOverview A Genkit tool for summarizing content using the Brave Summarizer API.
 * This tool requires an API key to be configured in the .env file.
 *
 * Required .env variables:
 * - BRAVE_SEARCH_API_KEY: Your API key for the Brave Search service.
 */

import {ai} from '@/ai/genkit';
import {z}from 'zod';

const BraveSummarizeInputSchema = z.object({
  summarizer_key: z.string().describe('The summarizer key obtained from the braveWebSearch tool.'),
});

const BraveSummarizeOutputSchema = z.object({
  title: z.string().describe('The title of the summarized content.'),
  summary: z.string().describe('The summarized content.'),
  context_sources: z.array(z.string()).describe('A list of URLs that were used to generate the summary.'),
  error: z.string().optional().describe('Any error message if the summarization failed.'),
});

export type BraveSummarizeOutput = z.infer<typeof BraveSummarizeOutputSchema>;

export const braveSummarize = ai.defineTool(
  {
    name: 'braveSummarize',
    description: 'Retrieves a summary using a key from a previous Brave Search call.',
    inputSchema: BraveSummarizeInputSchema,
    outputSchema: BraveSummarizeOutputSchema,
  },
  async ({summarizer_key}): Promise<BraveSummarizeOutput> => {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;

    if (!apiKey) {
      return { title: '', summary: '', context_sources: [], error: 'Brave Search API key (BRAVE_SEARCH_API_KEY) is not configured in .env. Cannot perform summarization.' };
    }

    try {
      const response = await fetch(`https://api.search.brave.com/res/v1/summarizer/search?key=${summarizer_key}&entity_info=1`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'x-subscription-token': apiKey,
          'Api-Version': '2024-04-23',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Summarizer API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
        return { title: '', summary: '', context_sources: [], error: `Summarizer API request failed: ${response.status} ${response.statusText}. Ensure API key and summarizer key are correct.` };
      }

      const data = await response.json();

      if (data.status !== 'complete') {
        console.warn("Summarizer API returned an incomplete status. Data:", data);
        return { title: '', summary: '', context_sources: [], error: `Summarizer API returned an incomplete status: ${data.status}` };
      }

      const title = data.title || '';
      const summary = data.summary || '';
      const context_sources = data.context_sources || [];

      return { title, summary, context_sources };

    } catch (e: any) {
      console.error("Brave Summarize tool error:", e);
      return { title: '', summary: '', context_sources: [], error: `An error occurred while performing the summarization: ${e.message}` };
    }
  }
);
