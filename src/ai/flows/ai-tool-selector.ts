'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting the appropriate tool based on a user's prompt.
 *
 * - suggestTool - A function that takes a user prompt and returns the suggested tool.
 * - SuggestToolInput - The input type for the suggestTool function.
 * - SuggestToolOutput - The return type for the suggestTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestToolInputSchema = z.object({
  prompt: z.string().describe('The user prompt to analyze.'),
});
export type SuggestToolInput = z.infer<typeof SuggestToolInputSchema>;

const SuggestToolOutputSchema = z.object({
  toolSuggestion: z.string().describe('The name of the suggested tool.'),
  reasoning: z.string().describe('The AI reasoning for suggesting the tool.'),
});
export type SuggestToolOutput = z.infer<typeof SuggestToolOutputSchema>;

export async function suggestTool(input: SuggestToolInput): Promise<SuggestToolOutput> {
  return suggestToolFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestToolPrompt',
  input: {schema: SuggestToolInputSchema},
  output: {schema: SuggestToolOutputSchema},
  prompt: `You are an AI assistant designed to suggest the most appropriate tool for a user based on their prompt.

  Analyze the following prompt and determine which tool would be most helpful.

  Prompt: {{{prompt}}}

  Respond with the name of the suggested tool and a brief explanation of why that tool is appropriate.

  Ensure that your response follows the output schema.
  `,
});

const suggestToolFlow = ai.defineFlow(
  {
    name: 'suggestToolFlow',
    inputSchema: SuggestToolInputSchema,
    outputSchema: SuggestToolOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
