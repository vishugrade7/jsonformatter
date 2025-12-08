
'use server';

import { suggestOptimalFormat, type SuggestOptimalFormatInput } from '@/ai/flows/suggest-optimal-format';

export async function getAIFormattedCode(input: SuggestOptimalFormatInput): Promise<{ data?: string; error?: string }> {
  try {
    const result = await suggestOptimalFormat(input);
    return { data: result.formattedCode };
  } catch (error) {
    console.error('AI Formatting Error:', error);
    return { error: 'Failed to format code with AI. Please check your input and try again.' };
  }
}

export async function getAISuggestions(input: SuggestOptimalFormatInput): Promise<{ data?: { formattedCode: string; suggestions: string }; error?: string }> {
  try {
    const result = await suggestOptimalFormat(input);
    return { data: result };
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return { error: 'Failed to get AI suggestions. Please check your input and try again.' };
  }
}
