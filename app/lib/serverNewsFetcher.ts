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
}

interface ArticleWithId extends NewsArticle {
  id: string;
}

export async function fetchNewsFromAPI(): Promise<NewsArticle[]> {
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=30&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await axios.get<{ articles: NewsArticle[] }>(url);
    const articles = response.data.articles.filter((article: NewsArticle) => 
      article.urlToImage && article.author
    );

    const articlesToInsert = articles.map(article => ({
      id: uuidv4(),
      title: article.title,
      description: article.description,
      author: article.author,
      urlToImage: article.urlToImage || null,
      publishedAt: article.publishedAt,
      source: JSON.stringify(article.source), 
      verified: false,
      slug: slugify(article.title),
      category: categorizeArticle(article.title, article.description || '')
    }));

    const { error } = await supabase
      .from('articles')
      .upsert(articlesToInsert, { 
        onConflict: 'slug',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('Error inserting/updating articles:', error);
    } else {
      console.log('Articles inserted/updated successfully');
    }

    return articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function getNews(): Promise<ArticleCardProps[]> {
  try {
    const newsArticles = await fetchNewsFromAPI();
    
    const uniqueArticles = new Map<string, ArticleWithId>();

    newsArticles.forEach((article: NewsArticle) => {
      const slug = slugify(article.title);
      if (!uniqueArticles.has(slug)) {
        uniqueArticles.set(slug, {
          ...article,
          id: uuidv4(),
        });
      }
    });

    const articlesToInsert = Array.from(uniqueArticles.values()).map((article) => ({
      id: article.id,
      title: article.title,
      description: article.description || '',
      author: article.author,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source,
      verified: false,
      slug: slugify(article.title),
      category: categorizeArticle(article.title, article.description || ''),
    }));

    const { error: insertError } = await supabase
      .from('articles')
      .upsert(articlesToInsert, { 
        onConflict: 'slug',
        ignoreDuplicates: true
      });

    if (insertError) {
      console.error("Error inserting/updating articles:", insertError);
    }

    // Fetch verified articles
    const { data: verifiedArticles, error: verifiedError } = await supabase
      .from('articles')
      .select('id, verifier')
      .in('id', articlesToInsert.map((a) => a.id));

    if (verifiedError) {
      console.error("Error fetching verified articles:", verifiedError);
    }
    const verifiedMap = new Map(verifiedArticles?.map(a => [a.id, a.verifier]) || []);
    const processedArticles: ArticleCardProps[] = articlesToInsert.map((article) => {
      const category = categorizeArticle(article.title, article.description || '');
      const slug = slugify(article.title);
      return {
        id: article.id,
        title: article.title,
        author: article.author,
        publishedAt: article.publishedAt,
        source:article.source,
        description: article.description || '',
        slug,
        verifiedBy: verifiedMap.get(article.id) || null,
        category,
        icon: categories[category as keyof typeof categories] || '📰',
        summary: '',
        urlToImage: article.urlToImage || null,
      };
    });

    return processedArticles;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return []; 
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleCardProps | null> {
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !article) {
    console.error("Error fetching article:", error);
    return null;
  }

  return {
    id: article.id,
    title: article.title,
    description: article.description || '',
    author: article.author,
    slug: article.slug,
    publishedAt: article.publishedAt || article.published_at, // Handle both camelCase and snake_case
    source: typeof article.source === 'string' ? JSON.parse(article.source) : article.source,
    category: article.category,
    icon: categories[article.category as keyof typeof categories] || '📰',
    urlToImage: article.urlToImage || null,
    verifiedBy: article.verifier || null,
    summary: article.summary || '',
  };
}

export function categorizeArticle(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  const categoryPatterns: Record<string, string[]> = {
    Technology: ['tech', 'software', 'hardware', 'ai', 'robot', 'computer', 'internet', 'cyber', 'digital', 'innovation', 'gadget', 'programming', 'algorithm', 'data'],
    Science: ['science', 'research', 'study', 'discovery', 'experiment', 'laboratory', 'hypothesis', 'theory', 'scientific', 'breakthrough', 'innovation'],
    Health: ['health', 'medical', 'disease', 'treatment', 'drug', 'vaccine', 'doctor', 'patient', 'healthcare', 'wellness', 'medicine', 'therapy', 'diagnosis', 'clinical'],
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
  "Health": "🩺",
  "Business": "💼",
  "Politics": "🏛️",
  "Environment": "🌿",
  "Space": "🚀",
  "Blockchain": "⛓️",
};
