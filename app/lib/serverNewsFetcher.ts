import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ArticleCardProps } from '../components/ArticleCard';
import { supabase } from './supabaseClient';
import { default as slugifyLib } from 'slugify';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

interface NewsArticle {
  title: string;
  description?: string;
  author: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  url_to_image?: string; 
}

export async function fetchNewsFromAPI(): Promise<NewsArticle[]> {
  const url = `https://newsapi.org/v2/top-headlines?country=gb&pageSize=30&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await axios.get<{ articles: NewsArticle[] }>(url);
    const articles = response.data.articles.filter((article: NewsArticle) => 
      article.urlToImage && article.author
    );

    const articlesToInsert = articles.map(article => ({
      ...article,
      url_to_image: article.urlToImage, 
      urlToImage: undefined 
    }));

    const { error } = await supabase
      .from('articles')
      .upsert(articlesToInsert, { 
        onConflict: 'slug',
        ignoreDuplicates: false // Changed to false to update existing entries
      });

    if (error) {
      console.error('Error inserting/updating articles:', error);
    } else {
      console.log('Articles inserted/updated successfully');
    }

    return articlesToInsert; // Return the modified articles
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function getNews(): Promise<ArticleCardProps[]> {
  try {
    const newsArticles = await fetchNewsFromAPI();
    console.log('Fetched from API:', newsArticles.length);

    const articlesToInsert = newsArticles.map((article) => ({
      id: uuidv4(),
      title: article.title,
      description: article.description || '',
      author: article.author || 'Unknown',
      url_to_image: article.url_to_image || article.urlToImage || null,
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: JSON.stringify(article.source),
      verified: false,
      slug: slugify(article.title),
      category: categorizeArticle(article.title, article.description || ''),
    }));

    const { data, error } = await supabase
      .from('articles')
      .upsert(articlesToInsert, { 
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error("Error inserting/updating articles:", error);
    } else {
      console.log('Upserted articles:', data?.length);
    }

    // Fetch all articles, including newly inserted ones
    const { data: allArticles, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .order('publishedAt', { ascending: false });

    if (fetchError) {
      console.error("Error fetching all articles:", fetchError);
      return [];
    }

    const processedArticles: ArticleCardProps[] = allArticles.map((article) => ({
      id: article.id,
      title: article.title,
      author: article.author,
      publishedAt: article.publishedAt,
      source: typeof article.source === 'string' 
        ? JSON.parse(article.source) 
        : (article.source || { name: 'Unknown' }),
      description: article.description || '',
      slug: article.slug,
      verifiedBy: article.verified_by || null,
      category: article.category || categorizeArticle(article.title, article.description || ''),
      icon: categories[article.category as keyof typeof categories] || '📰',
      summary: article.summary || '',
      url_to_image: article.url_to_image || null,
    }));

    console.log('Processed articles:', processedArticles.length);
    console.log('Sample article:', processedArticles[0]); // Log a sample article to check the url_to_image
    return processedArticles;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return []; 
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleCardProps | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    author: data.author,
    publishedAt: data.publishedAt,
    source: typeof data.source === 'string' ? JSON.parse(data.source) : data.source,
    category: data.category,
    icon: categories[data.category as keyof typeof categories] || '📰',
    url_to_image: data.url_to_image,
    verifiedBy: data.verified_by,
    summary: data.summary,
  };
}

export function categorizeArticle(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  const categoryPatterns: Record<string, string[]> = {
    Technology: ['tech', 'software', 'hardware', 'ai', 'robot', 'computer', 'internet', 'cyber', 'digital', 'innovation', 'gadget', 'programming', 'algorithm', 'data'],
    Science: ['science', 'research', 'study', 'discovery', 'experiment', 'laboratory', 'hypothesis', 'theory', 'scientific', 'breakthrough', 'innovation'],
     Business: ['business', 'economy', 'market', 'stock', 'company', 'startup', 'finance', 'investment', 'entrepreneur', 'corporate', 'industry', 'trade', 'commerce'],
    Politics: ['politic', 'government', 'election', 'war', 'ukraine', 'russia', 'policy', 'law', 'vote', 'congress', 'senate', 'legislation', 'diplomat', 'campaign', 'parliament', 'democracy'],
    Environment: ['environment', 'climate', 'green', 'sustainable', 'ecology', 'pollution', 'renewable', 'conservation', 'biodiversity', 'ecosystem', 'carbon'],
    Space: ['space', 'nasa', 'rocket', 'planet', 'star', 'galaxy', 'astronaut', 'satellite', 'cosmos', 'orbit', 'telescope', 'spacecraft', 'extraterrestrial'],
    Blockchain: ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'nft', 'defi', 'web3', 'cryptocurrency', 'token', 'ledger', 'mining', 'decentralized', 'smart contract'],
  };

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    if (patterns.some(pattern => text.includes(pattern))) {
      return category;
    }
  }

  return 'Other';
}

function slugify(title: string): string {
  return slugifyLib(title, { lower: true, remove: /[^\w\s-]/g });
}

export const categories = {
  "Technology": "🖥️",
  "Science": "🔬",
  "Business": "💼",
  "Politics": "🏛️",
  "Environment": "🌿",
  "Space": "🚀",
  "Blockchain": "⛓️",
};
