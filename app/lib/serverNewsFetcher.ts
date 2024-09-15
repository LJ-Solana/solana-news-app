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
  const url = `https://newsapi.org/v2/top-headlines?country=gb&pageSize=50&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await axios.get<{ articles: NewsArticle[] }>(url);
    const articles = response.data.articles.filter((article: NewsArticle) => 
      article.urlToImage && article.author
    );

    const articlesToInsert = articles.map(article => ({
      id: uuidv4(),
      title: article.title,
      description: article.description || null, 
      author: article.author,
      url_to_image: article.urlToImage || null,  // Change this line
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
    // Fetch new articles from API
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
      description: article.description || null, 
      author: article.author,
      url_to_image: article.urlToImage,  // Change this line
      publishedAt: article.publishedAt,
      source: article.source,
      verified: false,
      slug: slugify(article.title),
      category: categorizeArticle(article.title, article.description || ''),
    }));

    // Upsert new articles
    const { error: insertError } = await supabase
      .from('articles')
      .upsert(articlesToInsert, { 
        onConflict: 'slug',
        ignoreDuplicates: true
      });

    if (insertError) {
      console.error("Error inserting/updating articles:", insertError);
    }

    // Fetch all articles, including verified ones
    const { data: allArticles, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .order('publishedAt', { ascending: false });

    if (fetchError) {
      console.error("Error fetching all articles:", fetchError);
      return [];
    }

    const processedArticles: ArticleCardProps[] = allArticles.map((article) => {
      const category = article.category || categorizeArticle(article.title, article.description || '');
      return {
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
        category,
        icon: categories[category as keyof typeof categories] || '📰',
        summary: article.summary || '',
        urlToImage: article.url_to_image || null,  // Change this line
      };
    });

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
    urlToImage: data.url_to_image,
    verifiedBy: data.verified_by,
    summary: data.summary,
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
