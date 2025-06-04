
/**
 * @fileOverview A Genkit tool for performing web searches via a specified API.
 * This tool requires an API key and potentially an endpoint to be configured
 * in the .env file.
 *
 * Required .env variables:
 * - SPECIFIC_SEARCH_API_KEY: Your API key for the search service.
 * - SPECIFIC_SEARCH_API_ENDPOINT: The endpoint URL for the search service.
 * - GOOGLE_CUSTOM_SEARCH_CX: (Optional) Your Google Custom Search Engine ID, if using Google CSE.
 */

import {ai} from '@/ai/genkit';
import {z}from 'zod';

const WebSearchInputSchema = z.object({
  query: z.string().describe('The search query for the web.'),
});

const WebSearchResultItemSchema = z.object({
  title: z.string().describe('The title of the search result.'),
  link: z.string().describe('The URL of the search result.'),
  snippet: z.string().optional().describe('A brief snippet of the search result content.'),
});

const WebSearchOutputSchema = z.object({
  results: z.array(WebSearchResultItemSchema).describe('A list of search results.'),
  error: z.string().optional().describe('Any error message if the search failed or if the tool is not fully configured.'),
});
export type WebSearchOutput = z.infer<typeof WebSearchOutputSchema>;


export const performWebSearchTool = ai.defineTool(
  {
    name: 'performWebSearch',
    description: 'Performs a web search using a configured third-party API. CRITICAL: Requires SPECIFIC_SEARCH_API_KEY and SPECIFIC_SEARCH_API_ENDPOINT to be set in the .env file. If using Google Custom Search, GOOGLE_CUSTOM_SEARCH_CX is also required in .env. If these are not set, the tool will return an error.',
    inputSchema: WebSearchInputSchema,
    outputSchema: WebSearchOutputSchema,
  },
  async ({query}): Promise<WebSearchOutput> => {
    const apiKey = process.env.SPECIFIC_SEARCH_API_KEY;
    const apiEndpoint = process.env.SPECIFIC_SEARCH_API_ENDPOINT;
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX;

    if (!apiKey) {
      return { results: [], error: 'Search API key (SPECIFIC_SEARCH_API_KEY) is not configured in .env. Cannot perform live web search.' };
    }
    if (!apiEndpoint) {
      return { results: [], error: 'Search API endpoint (SPECIFIC_SEARCH_API_ENDPOINT) is not configured in .env.' };
    }
    // For Google Custom Search, 'cx' is also required, but the tool can attempt to run without it if not using Google CSE.
    // The API itself will likely fail if cx is needed but not provided for Google CSE.


    try {
      const searchParams = new URLSearchParams({
        q: query,
        key: apiKey,
      });
      if (cx) {
        searchParams.append('cx', cx);
      }
      // searchParams.append('num', '5');

      const response = await fetch(`${apiEndpoint}?${searchParams.toString()}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Search API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
        return { results: [], error: `Search API request failed: ${response.status} ${response.statusText}. Ensure API key, endpoint, and CX (if applicable) are correct.` };
      }

      const data = await response.json();

      let mappedResults: { title: string; link: string; snippet?: string }[] = [];
      if (data.items && Array.isArray(data.items)) {
        mappedResults = data.items.map((item: any) => ({
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

      return { results: mappedResults };

    } catch (e: any) {
      console.error("Web search tool error:", e);
      return { results: [], error: `An error occurred while performing the web search: ${e.message}` };
    }
  }
);

