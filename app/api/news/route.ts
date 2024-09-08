import { NextResponse } from 'next/server';

interface NewsArticle {
  title: string;
  description?: string;
  author?: string;
  urlToImage?: string;
}

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function GET() {
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=30&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Filter out articles with [removed] in the title or description, with unknown authors, or without images
    const filteredArticles = data.articles.filter((article: NewsArticle) => 
      !article.title.includes('[removed]') && 
      !article.description?.includes('[removed]') &&
      article.author && article.author !== 'unknown' &&
      article.urlToImage
    );

    // Return the filtered data
    return NextResponse.json({ ...data, articles: filteredArticles });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}