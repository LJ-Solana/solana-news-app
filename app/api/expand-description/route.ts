import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { description } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that expands on article descriptions." },
        { role: "user", content: `Expand on this article description, providing more context and details: ${description}` }
      ],
      max_tokens: 300  
    });

    return NextResponse.json({ expandedDescription: response.choices[0].message.content });
  } catch (error) {
    console.error('Error in expand-description API:', error);
    return NextResponse.json({ 
      error: 'Failed to expand description', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}