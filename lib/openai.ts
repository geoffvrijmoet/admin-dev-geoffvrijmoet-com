import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful business advisor specializing in freelance and client acquisition strategies. Provide specific, actionable advice based on proven business practices."
      },
      ...messages
    ],
  });

  return completion.choices[0].message.content;
} 