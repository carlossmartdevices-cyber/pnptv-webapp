'use server';

/**
 * @fileOverview Implements the AI chatbot support feature.
 *
 * - askCristina - A function that sends the user's query to a Google AI model (Gemini) with a specific prompt to act as a support agent.
 * - AskCristinaInput - The input type for the askCristina function.
 * - AskCristinaOutput - The return type for the askCristina function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskCristinaInputSchema = z.object({
  query: z.string().describe('The user query for the support chatbot.'),
});
export type AskCristinaInput = z.infer<typeof AskCristinaInputSchema>;

const AskCristinaOutputSchema = z.object({
  response: z.string().describe('The response from the support chatbot.'),
});
export type AskCristinaOutput = z.infer<typeof AskCristinaOutputSchema>;

export async function askCristina(input: AskCristinaInput): Promise<AskCristinaOutput> {
  return askCristinaFlow(input);
}

const askCristinaPrompt = ai.definePrompt({
  name: 'askCristinaPrompt',
  input: {schema: AskCristinaInputSchema},
  output: {schema: AskCristinaOutputSchema},
  prompt: `You are Cristina, a friendly and helpful AI support agent for PNPtv Spark. Answer the following user query:

{{{query}}}`,
});

const askCristinaFlow = ai.defineFlow(
  {
    name: 'askCristinaFlow',
    inputSchema: AskCristinaInputSchema,
    outputSchema: AskCristinaOutputSchema,
  },
  async input => {
    const {output} = await askCristinaPrompt(input);
    return output!;
  }
);
