import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    console.log('Received request to expand description');
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { description } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that expands on article descriptions in a factual manner. Provide a well-structured response with paragraphs separated by newlines." },
        { role: "user", content: `Expand on this article description, providing more context, details, and factual evidence. Ensure your response is complete and well-structured: ${description}` }
      ],
      max_tokens: 500,
      temperature: 0.7,
      stop: ["\n\n\n"]  
    });

    const formattedResponse = response.choices[0].message.content?.trim().split('\n\n').join('\n\n') || '';

    console.log('OpenAI API response received');
    console.log('Sending response');
    return NextResponse.json({ expandedDescription: formattedResponse });
  } catch (error) {
    console.error('Detailed error in expand-description API:', error);
    console.error('Error in expand-description API:', error);
    return NextResponse.json({ 
      error: 'Failed to expand description', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}