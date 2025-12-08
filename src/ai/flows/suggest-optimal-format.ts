'use server';

/**
 * @fileOverview AI tool to suggest best-practice formats and layouts for code.
 *
 * - suggestOptimalFormat - A function that suggests optimal formats for code.
 * - SuggestOptimalFormatInput - The input type for the suggestOptimalFormat function.
 * - SuggestOptimalFormatOutput - The return type for the suggestOptimalFormat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalFormatInputSchema = z.object({
  code: z.string().describe('The code to be formatted.'),
  language: z.string().describe('The programming language of the code.'),
});
export type SuggestOptimalFormatInput = z.infer<typeof SuggestOptimalFormatInputSchema>;

const SuggestOptimalFormatOutputSchema = z.object({
  formattedCode: z.string().describe('The formatted code with best-practice layouts.'),
  suggestions: z.string().describe('Suggestions for improving the code format and readability.'),
});
export type SuggestOptimalFormatOutput = z.infer<typeof SuggestOptimalFormatOutputSchema>;

export async function suggestOptimalFormat(input: SuggestOptimalFormatInput): Promise<SuggestOptimalFormatOutput> {
  return suggestOptimalFormatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalFormatPrompt',
  input: {schema: SuggestOptimalFormatInputSchema},
  output: {schema: SuggestOptimalFormatOutputSchema},
  prompt: `You are an AI code formatter that suggests the best-practice formats and layouts for code to enhance readability and maintainability.

  Analyze the following code and provide a formatted version along with suggestions for improvement.

  Language: {{{language}}}
  Code: {{{code}}}

  Ensure the formatted code adheres to industry best practices and is easy to read and understand.
  Suggestions should be clear and actionable.
  `,
});

const suggestOptimalFormatFlow = ai.defineFlow(
  {
    name: 'suggestOptimalFormatFlow',
    inputSchema: SuggestOptimalFormatInputSchema,
    outputSchema: SuggestOptimalFormatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
