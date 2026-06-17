'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating information about the SBG Bot.
 *
 * - generateBotInfo - A function that provides concise, AI-generated explanations about the bot's purpose or how to use it.
 * - BotInfoGeneratorInput - The input type for the generateBotInfo function.
 * - BotInfoGeneratorOutput - The return type for the generateBotInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BotInfoGeneratorInputSchema = z.object({
  query: z.string().describe('The user\'s question about the bot\'s purpose or how to use it.'),
});
export type BotInfoGeneratorInput = z.infer<typeof BotInfoGeneratorInputSchema>;

const BotInfoGeneratorOutputSchema = z.object({
  response: z.string().describe('A concise, AI-generated explanation about the SBG Bot.'),
});
export type BotInfoGeneratorOutput = z.infer<typeof BotInfoGeneratorOutputSchema>;

const botDescription = `The SBG Bot (Small But Genius) is a powerful, enterprise-grade WhatsApp Bot designed for dynamic and intelligent interactions.

Key Capabilities:
- **Multi-Provider Database Sync**: Automatically connects to various databases (MongoDB, Supabase, Neon, SQL, or in-memory LowDB) for persistent data management, ensuring zero hardcoding.
- **Dynamic Session Handshake**: Features encoded Base64 session handling with support for custom prefixes (e.g., SBG~, ASTRAX~) for secure, multi-session authentication.
- **Modular Command Engine**: A plugin-based router dynamically loads general commands, event-based handlers, and anti-system features, making the bot highly extensible.
- **Intelligent Agent Flow**: Utilizes generative AI to understand user intents and route incoming WhatsApp messages to specific logic blocks, enabling smart responses.
- **Public Presence Dashboard**: A Next.js hosted status portal displaying bot health, connection stability, and real-time session logs for transparency and monitoring.
- **Structural Message Formatter**: Enforces a consistent, elegant boxed-style visual architecture for all bot replies and critical notifications, enhancing user experience.
- **Autonomous Resource Janitor**: An automated background service that monitors RAM usage and cleans orphaned sessions to ensure high uptime and optimal performance.`;

const botInfoPrompt = ai.definePrompt({
  name: 'botInfoPrompt',
  input: { schema: BotInfoGeneratorInputSchema },
  output: { schema: BotInfoGeneratorOutputSchema },
  prompt: `You are the SBG Bot (Small But Genius). Your purpose is to provide concise and helpful information about yourself based on the following documentation.

Bot Documentation:
${botDescription}

Based on the user's question, provide a clear and concise explanation about your purpose or how to use you. Keep the response to 2-3 sentences max.

User's Question: {{{query}}}

Your Answer:`,
});

const botInfoGeneratorFlow = ai.defineFlow(
  {
    name: 'botInfoGeneratorFlow',
    inputSchema: BotInfoGeneratorInputSchema,
    outputSchema: BotInfoGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await botInfoPrompt(input);
    return output!;
  }
);

export async function generateBotInfo(input: BotInfoGeneratorInput): Promise<BotInfoGeneratorOutput> {
  return botInfoGeneratorFlow(input);
}
