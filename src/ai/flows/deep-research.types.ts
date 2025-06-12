import { z } from 'genkit';

export const DeepResearchInputSchema = z.object({
  query: z.string().describe('The research topic or question.'),
});
export type DeepResearchInput = z.infer<typeof DeepResearchInputSchema>;

export const DeepResearchOutputSchema = z.object({
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
