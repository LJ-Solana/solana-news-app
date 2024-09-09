import axios from 'axios';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArticleCardProps } from '../components/ArticleCard';
import { supabase } from './supabaseClient';
import slugify from 'slugify';

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

export function useNews() {
  const [articles, setArticles] = useState<ArticleCardProps[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleCardProps[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleCardProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      const newsData = await getNews();
      setArticles(newsData);
      setFeaturedArticles(newsData.slice(0, 3));
    }
    fetchNews();
  }, []);

  useEffect(() => {
    const featuredIds = new Set(featuredArticles.map(article => article.id));
    setFilteredArticles(
      selectedCategory
        ? articles.filter(article => article.category === selectedCategory)
        : articles.filter(article => !featuredIds.has(article.id))
    );
  }, [articles, selectedCategory, featuredArticles]);

  return {
    articles,
    featuredArticles,
    filteredArticles,
    selectedCategory,
    setSelectedCategory
  };
}

export async function fetchNewsFromAPI(): Promise<NewsArticle[]> {
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=30&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await axios.get<{ articles: NewsArticle[] }>(url, {
      headers: {
        'User-Agent': 'ByteNews/1.0',
      },
    });
    return response.data.articles.filter((article: NewsArticle) => 
      article.urlToImage && article.author
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function getNews(): Promise<ArticleCardProps[]> {
  try {
    const newsArticles = await fetchNewsFromAPI();
    
    const articlesWithIds: ArticleWithId[] = newsArticles.map((article: NewsArticle) => ({
      ...article,
      id: uuidv4(), 
    }));

    // Insert all articles into Supabase
    const { error: insertError } = await supabase
      .from('articles')
      .upsert(articlesWithIds.map((article: ArticleWithId) => ({
        id: article.id, 
        title: article.title,
        description: article.description || '',
        author: article.author,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
        verified: false,
        slug: slugify(article.title),
        category: categorizeArticle(article.title, article.description || ''),
      })), { onConflict: 'id' });

    if (insertError) {
      console.error("Error inserting/updating articles:", insertError);
    }

    // Fetch verified articles
    const { data: verifiedArticles, error: verifiedError } = await supabase
      .from('articles')
      .select('id, verifier')
      .in('id', articlesWithIds.map((a: ArticleWithId) => a.id));

    if (verifiedError) {
      console.error("Error fetching verified articles:", verifiedError);
    }
    const verifiedMap = new Map(verifiedArticles?.map(a => [a.id, a.verifier]) || []);
    const processedArticles: ArticleCardProps[] = articlesWithIds.map((article: ArticleWithId) => {
      const category = categorizeArticle(article.title, article.description || '');
      const slug = slugify(article.title);
      return {
        ...article,
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

  const summary = await generateSummary(article.description || article.title);

  return {
    id: article.id,
    title: article.title,
    description: article.description || '',
    author: article.author,
    slug: article.slug,
    publishedAt: article.publishedAt,
    source: { name: article.source },
    category: article.category,
    icon: categories[article.category as keyof typeof categories] || '📰',
    urlToImage: article.urlToImage || null,
    verifiedBy: article.verifier,
    summary,
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

async function generateSummary(content: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return "An error occurred while generating the summary.";
  }
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
