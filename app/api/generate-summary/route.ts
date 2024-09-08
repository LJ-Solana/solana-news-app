import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { content } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes news articles concisely."
        },
        {
          role: "user",
          content: `Please provide a brief summary of the following news article: ${content}`
        }
      ],
      max_tokens: 150
    });

    return NextResponse.json({ summary: response.choices[0].message.content });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
