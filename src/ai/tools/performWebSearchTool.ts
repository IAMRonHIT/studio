
/**
 * @fileOverview A Genkit tool for performing web searches via the Brave Search API.
 * This tool requires an API key to be configured in the .env file.
 *
 * Required .env variables:
 * - BRAVE_SEARCH_API_KEY: Your API key for the Brave Search service.
 */

import {ai} from '@/ai/genkit';
import {z}from 'zod';

const BraveWebSearchInputSchema = z.object({
  query: z.string().describe('The search query for the web.'),
  goggle: z.string().optional().describe('The Goggle definition to use for filtering search results.'),
  goggle_id: z.string().optional().describe('The Goggle ID to use for filtering search results.'),
});

const BraveWebSearchResultItemSchema = z.object({
  title: z.string().describe('The title of the search result.'),
  link: z.string().describe('The URL of the search result.'),
  snippet: z.string().optional().describe('A brief snippet of the search result content.'),
});

const BraveWebSearchOutputSchema = z.object({
  results: z.array(BraveWebSearchResultItemSchema).describe('A list of search results.'),
  summarizer_key: z.string().optional().describe('The key to use for the summarizer API.'),
  error: z.string().optional().describe('Any error message if the search failed or if the tool is not fully configured.'),
});
export type WebSearchOutput = z.infer<typeof BraveWebSearchOutputSchema>;


export const braveWebSearch = ai.defineTool(
  {
    name: 'braveWebSearch',
    description: 'Performs a web search using the Brave Search API, filtered by the ron-ai.goggle, and returns a summarizer key.',
    inputSchema: BraveWebSearchInputSchema,
    outputSchema: BraveWebSearchOutputSchema,
  },
  async ({query, goggle, goggle_id}): Promise<WebSearchOutput> => {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;

    try {
      const searchParams = new URLSearchParams({
        q: query,
        freshness: 'year',
        units: 'imperial',
        goggles_id: 'https://gist.githubusercontent.com/RonsDad/669383264435c45be4a76da5158a5d05/raw',
        goggles: 'https://gist.githubusercontent.com/RonsDad/669383264435c45be4a76da5158a5d05/raw',
        extra_snippets: 'true',
        summary: 'true'
      });

      const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${searchParams.toString()}`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'x-subscription-token': apiKey ?? '',
          'Api-Version': '2023-10-11',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Search API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
        return { results: [], error: `Search API request failed: ${response.status} ${response.statusText}. Ensure API key and endpoint are correct.` };
      }

      const data = await response.json();

      let mappedResults: { title: string; link: string; snippet?: string }[] = [];
      if (data.items && Array.isArray(data.items)) {
        mappedResults = data.items.map((item: any): { title: string; link: string; snippet?: string } => ({
          title: item.title || 'No title',
          link: item.link || '#',
          snippet: item.snippet || 'No snippet available.',
        })).slice(0, 5);
      } else {
        console.warn("Search API response format unexpected or no items found. Data:", data);
        return { results: [], error: "Search API returned no results or an unexpected format."}
      }

      if (mappedResults.length === 0) {
        return { results: [], error: `No search results found for query: "${query}"` };
      }

      const summarizer_key = data.summarizer?.key;

      return { results: mappedResults, summarizer_key };

    } catch (e: any) {
      console.error("Web search tool error:", e);
      return { results: [], error: `An error occurred while performing the web search: ${e.message}` };
    }
  }
);
