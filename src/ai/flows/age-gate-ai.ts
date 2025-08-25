'use server';

/**
 * @fileOverview AI-powered age verification flow using facial recognition.
 *
 * - ageGateAi - A function that handles the age verification process using AI.
 * - AgeGateAiInput - The input type for the ageGateAi function.
 * - AgeGateAiOutput - The return type for the ageGateAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgeGateAiInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  expressionDescription: z
    .string()
    .describe(
      'A description of the facial expression that indicates understanding of the TOS.'
    ),
});
export type AgeGateAiInput = z.infer<typeof AgeGateAiInputSchema>;

const AgeGateAiOutputSchema = z.object({
  isAgeVerified: z
    .boolean()
    .describe(
      'Whether or not the AI has verified that the user understands the terms of service and is therefore assumed to be old enough to use the application.'
    ),
  confidence: z
    .number()
    .describe(
      'The confidence level of the AI in its age verification decision (0-1).'
    ),
});
export type AgeGateAiOutput = z.infer<typeof AgeGateAiOutputSchema>;

export async function ageGateAi(input: AgeGateAiInput): Promise<AgeGateAiOutput> {
  return ageGateAiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ageGateAiPrompt',
  input: {schema: AgeGateAiInputSchema},
  output: {schema: AgeGateAiOutputSchema},
  prompt: `You are an AI assistant that analyzes facial expressions in a photo to determine if the user understands the terms of service.

You will receive a photo of the user's face and a description of the expression that indicates understanding.

Based on the photo, determine if the user has the described expression. Return a confidence score between 0 and 1 indicating your certainty.

Photo: {{media url=photoDataUri}}
Description: {{{expressionDescription}}}

Set isAgeVerified to true if the user has the described expression and you are confident they understand the terms of service.
`,
});

const ageGateAiFlow = ai.defineFlow(
  {
    name: 'ageGateAiFlow',
    inputSchema: AgeGateAiInputSchema,
    outputSchema: AgeGateAiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
