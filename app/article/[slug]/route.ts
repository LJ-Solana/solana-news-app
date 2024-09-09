import { NextResponse } from 'next/server';
import { ArticleCardProps } from '../../components/ArticleCard';
import { categorizeArticle, categories } from '../../lib/newsFetcher';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

async function fetchNewsFromAPI() {
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=30&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const newsArticles = await fetchNewsFromAPI();
  const article = newsArticles.find((a: any) => a.title.toLowerCase().replace(/\s+/g, '-') === slug);
  
  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const category = categorizeArticle(article.title, article.description);

  const articleData: ArticleCardProps = {
    id: slug,
    slug,
    title: article.title,
    description: article.description,
    author: article.author,
    publishedAt: article.publishedAt,
    source: article.source,
    category,
    icon: categories[category as keyof typeof categories] || '📰',
    urlToImage: article.urlToImage,
    verifiedBy: undefined, 
  };

  return NextResponse.json(articleData);
}
