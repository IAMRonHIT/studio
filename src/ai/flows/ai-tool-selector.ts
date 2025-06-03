
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting the appropriate tool 
 * based on a user's prompt or engaging in a conversational reply.
 *
 * - suggestTool - A function that takes a user prompt and returns the suggested tool or a conversational response.
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
  toolSuggestion: z.string().describe('The name of the suggested tool (e.g., "GFR Calculator", "Code Editor Helper", "Image Generator"). If the prompt is purely conversational and no tool is appropriate, respond with "CONVERSATIONAL_RESPONSE".'),
  reasoning: z.string().describe('The AI reasoning for suggesting the tool, or a direct conversational reply if "CONVERSATIONAL_RESPONSE" is the toolSuggestion.'),
});
export type SuggestToolOutput = z.infer<typeof SuggestToolOutputSchema>;

export async function suggestTool(input: SuggestToolInput): Promise<SuggestToolOutput> {
  return suggestToolFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestToolPrompt',
  input: {schema: SuggestToolInputSchema},
  output: {schema: SuggestToolOutputSchema},
  prompt: `You are an AI assistant designed to suggest the most appropriate tool for a user based on their prompt, OR to engage in helpful conversation if no tool is relevant.

  Analyze the following prompt:
  Prompt: {{{prompt}}}

  Available tools and their triggers:
  - "GFR Calculator": User explicitly asks for a GFR calculator or a tool to calculate glomerular filtration rate.
  - "Code Editor Helper": User asks for help writing, completing, generating, or explaining code (e.g., JavaScript, HTML, Python, functions, components).
  - "Image Generator": User asks to generate or create an image.

  Decision Process:
  1. If the prompt clearly matches one of the tool triggers above, set 'toolSuggestion' to the corresponding tool name (e.g., "GFR Calculator", "Code Editor Helper", "Image Generator"). Provide a brief explanation for your choice in the 'reasoning' field.
  2. If the prompt is purely conversational (e.g., discussing a patient case, asking a general question not related to a specific tool's function, making a statement, or general chat) or if no specific tool is a clear fit, set 'toolSuggestion' to "CONVERSATIONAL_RESPONSE". In this case, the 'reasoning' field should contain your direct, helpful, and conversational reply to the user's prompt.

  Ensure your response strictly follows the output schema.
  Examples:
  - User Prompt: "Hey Ron, I need a GFR Calculator in my workflows"
    Output: toolSuggestion: "GFR Calculator", reasoning: "The user explicitly asked for a GFR calculator."
  - User Prompt: "Can you help me write a JavaScript function to sort an array?"
    Output: toolSuggestion: "Code Editor Helper", reasoning: "The user needs assistance with writing a JavaScript function."
  - User Prompt: "My patient is presenting with symptoms of flu."
    Output: toolSuggestion: "CONVERSATIONAL_RESPONSE", reasoning: "I'm sorry to hear that. What are the specific symptoms, and how can I assist you further with managing this case or finding relevant information?"
  - User Prompt: "Generate a picture of a serene landscape"
    Output: toolSuggestion: "Image Generator", reasoning: "The user wants to generate an image."
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

