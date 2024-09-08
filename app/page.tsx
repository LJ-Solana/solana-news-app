"use client";

import React from 'react';
import Link from 'next/link';
import ArticleCard, { ArticleCardProps } from './components/ArticleCard';
import { FaNewspaper, FaStar, FaClock, FaPlus, FaCheck, FaTrophy } from 'react-icons/fa';
import WalletButton from './components/WalletButton';
import { useState, useEffect } from 'react';

async function getNews() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = `${baseUrl}/api/news`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return { articles: [] }; 
  }
}

// Updated categories and emojis
const categories = {
  "Technology": "🖥️",
  "Science": "🔬",
  "Health": "🩺",
  "Business": "💼",
  "Politics": "🏛️",
  "Environment": "🌿",
  "Space": "🚀",
  "Blockchain": "⛓️",
};

interface Article {
  slug: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  source: {
    name: string;
  };
  urlToImage: string | null;
  category: string;
  verifiedBy?: string;
}

function categorizeArticle(title: string, description: string): string {
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

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<ArticleCardProps[]>([]);

  useEffect(() => {
    async function fetchNews() {
      const newsData = await getNews();
      const processedArticles = newsData.articles.map((article: Article) => {
        const category = categorizeArticle(article.title, article.description);
        return {
          slug: encodeURIComponent(article.title?.toLowerCase().replace(/ /g, '-') || ''),
          title: article.title || 'Untitled Article',
          description: article.description || "No description available",
          author: article.author || 'Unknown Author',
          publishedAt: article.publishedAt,
          source: article.source || { name: 'Unknown Source' },
          category: category,
          icon: categories[category as keyof typeof categories] || '📰',
          urlToImage: article.urlToImage,
          verifiedBy: article.verifiedBy, // Add this line
        };
      });
      setArticles(processedArticles);
    }
    fetchNews();
  }, []);

  const filteredArticles = selectedCategory
    ? articles.filter(article => article.category === selectedCategory)
    : articles;

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            <Link href="/add-article" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center">
              <FaPlus className="mr-2" /> Create New Article
            </Link>
            <Link href="/verify-article" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center">
              <FaCheck className="mr-2" /> Verify Articles
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link href="/leaderboard" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center">
              <FaTrophy className="mr-2" /> Leaderboard
            </Link>
            <WalletButton />
          </div>
        </div>
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">Byte News</h1>
          <p className="text-xl text-gray-600">Your Byte-Sized, Open Source for Cutting-Edge Tech and Science Updates</p>
        </header>
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FaNewspaper className="mr-2 text-green-500" />
            Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-4 w-full">
            {Object.entries(categories).map(([category, icon]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                className={`flex-grow px-6 py-3 rounded-full shadow-md font-semibold transition duration-300 cursor-pointer text-center text-lg ${
                  category === selectedCategory
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {icon} {category}
              </button>
            ))}
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FaStar className="mr-2 text-yellow-500" />
            Featured Bytes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(0, 3).map((article, index) => (
              <ArticleCard key={index} {...article} featured={true} />
            ))}
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FaClock className="mr-2 text-blue-500" />
            {selectedCategory ? `${selectedCategory} Bytes` : 'Latest Bytes'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <ArticleCard 
                key={index} 
                {...article}
              />
            ))}
          </div>
        </section>
      </div>
      
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">Byte News</h3>
              <p className="text-gray-400">Delivering byte-sized tech and science updates, every day.</p>
            </div>
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">Quick Links</h3>
              <ul className="text-gray-400 space-y-2">
                <li><Link href="/" className="hover:text-white transition duration-300">Home</Link></li>
                <li><Link href="/categories" className="hover:text-white transition duration-300">Categories</Link></li>
                <li><Link href="/about" className="hover:text-white transition duration-300">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition duration-300">Contact</Link></li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for daily byte-sized updates.</p>
              <div className="flex">
                <input type="email" placeholder="Enter your email" className="bg-gray-700 text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-r-md transition duration-300">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center text-gray-400">
            <p>&copy; 2024 Byte News. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}