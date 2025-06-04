
/**
 * @fileOverview Defines the Code Completion Agent.
 * This agent specializes in generating code snippets.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const AiCodeCompletionInputSchema = z.object({
  codeSnippet: z.string().describe('The current code snippet in the editor, or a description of the code needed.'),
  programmingLanguage: z.string().describe('The programming language of the code snippet.'),
  cursorPosition: z.number().optional().describe('The current cursor position in the code snippet, if applicable.'),
  userRequest: z.string().optional().describe('The original user request or context for code generation.'),
});
export type AiCodeCompletionInput = z.infer<typeof AiCodeCompletionInputSchema>;

const AiCodeCompletionOutputSchema = z.object({
  completedCode: z.string().describe('The code completion suggestion or generated code.'),
});
export type AiCodeCompletionOutput = z.infer<typeof AiCodeCompletionOutputSchema>;


// This is the specialist agent prompt, to be used as a tool by the TriageAgent
export const codeCompletionAgentPrompt = ai.definePrompt({
  name: 'codeCompletionAgentPrompt',
  description: 'Generates or completes code snippets based on user requests. Use this for tasks like writing functions, components, or explaining code.',
  model: 'googleai/gemini-1.5-flash-latest', // Fallback model
  input: {schema: AiCodeCompletionInputSchema},
  output: {schema: AiCodeCompletionOutputSchema},
  prompt: `You are an AI code completion assistant.
User's original request: {{{userRequest}}}
Current code snippet (if any, or context for new code):
{{{codeSnippet}}}

Programming Language: {{{programmingLanguage}}}
{{#if cursorPosition}}Cursor Position: {{{cursorPosition}}}{{/if}}

Generate the appropriate code. If the request is to explain code, provide the explanation as commented-out code or a markdown block within the code response.
Focus on providing functional, clean, and relevant code.
Output only the code itself.
`,
});

// Wrapper function to invoke this agent/prompt directly if ever needed,
// though typically it's called as a tool by the TriageAgent.
export async function runCodeCompletionAgent(input: AiCodeCompletionInput): Promise<AiCodeCompletionOutput> {
  const { output } = await codeCompletionAgentPrompt(input);
  if (!output) {
    throw new Error("Code completion agent failed to produce output.");
  }
  return output;
}

      
