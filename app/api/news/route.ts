import { NextResponse } from 'next/server';
import { fetchNewsFromAPI } from '../../lib/newsFetcher';

export async function GET() {
  try {
    const news = await fetchNewsFromAPI();
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
