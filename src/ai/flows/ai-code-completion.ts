// src/ai/flows/ai-code-completion.ts
'use server';

/**
 * @fileOverview Provides AI-powered code completion suggestions for the IDE editor.
 *
 * - aiCodeCompletion - A function that generates code completion suggestions.
 * - AiCodeCompletionInput - The input type for the aiCodeCompletion function.
 * - AiCodeCompletionOutput - The return type for the aiCodeCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCodeCompletionInputSchema = z.object({
  codeSnippet: z.string().describe('The current code snippet in the editor.'),
  programmingLanguage: z.string().describe('The programming language of the code snippet.'),
  cursorPosition: z.number().describe('The current cursor position in the code snippet.'),
});
export type AiCodeCompletionInput = z.infer<typeof AiCodeCompletionInputSchema>;

const AiCodeCompletionOutputSchema = z.object({
  completedCode: z.string().describe('The code completion suggestion.'),
});
export type AiCodeCompletionOutput = z.infer<typeof AiCodeCompletionOutputSchema>;

export async function aiCodeCompletion(input: AiCodeCompletionInput): Promise<AiCodeCompletionOutput> {
  return aiCodeCompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeCompletionPrompt',
  input: {schema: AiCodeCompletionInputSchema},
  output: {schema: AiCodeCompletionOutputSchema},
  prompt: `You are an AI code completion assistant. Given the following code snippet, programming language, and cursor position, provide a code completion suggestion that seamlessly integrates into the existing code.

Programming Language: {{{programmingLanguage}}}
Code Snippet:
{{codeSnippet}}

Cursor Position: {{{cursorPosition}}}

Completion:`, // Removed triple curly braces
});

const aiCodeCompletionFlow = ai.defineFlow(
  {
    name: 'aiCodeCompletionFlow',
    inputSchema: AiCodeCompletionInputSchema,
    outputSchema: AiCodeCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
