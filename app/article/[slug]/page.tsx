'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { FaStar, FaArrowLeft, FaCalendarAlt, FaUser, FaLink, FaInfoCircle } from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '../../lib/solanaClient';
import { queryContentRatings } from '../../lib/queryContentRatings';
import { getPDAFromContentHash, generateContentHash } from '../../lib/articleVerification';
import { Program, Idl } from '@project-serum/anchor';

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [expandedDescription, setExpandedDescription] = useState<string | null>(null);
  const wallet = useWallet();

  useEffect(() => {
    async function fetchArticle() {
      if (typeof slug !== 'string') return;

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
      } else {
        setArticle(data);
        fetchRating(data);
        expandDescription(data.description);
      }
      setLoading(false);
    }

    fetchArticle();
  }, [slug]);

  const fetchRating = async (articleData: any) => {
    if (wallet.connected && wallet.publicKey && articleData.onChainVerification) {
      const program = getProgram();
      if (!program) {
        console.error('Failed to get program');
        return;
      }
      const contentHash = generateContentHash({ title: articleData.title, content: articleData.description });
      const contentPDA = getPDAFromContentHash(contentHash);
      try {
        const { averageRating } = await queryContentRatings(program as unknown as Program<Idl>, contentPDA);
        setRating(averageRating);
      } catch (error) {
        console.error('Error fetching rating:', error);
        setRating(null);
      }
    } else {
      setRating(null);
    }
  };

  const expandDescription = async (description: string) => {
    try {
      const response = await fetch('/api/expand-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to expand description: ${errorData.error}, ${errorData.details}`);
      }

      const data = await response.json();
      setExpandedDescription(data.expandedDescription);
    } catch (error) {
      console.error('Error expanding description:', error);
      setExpandedDescription(null);
    }
  };

  const renderStars = () => {
    if (!article?.onChainVerification) {
      return <span className="text-gray-400 text-sm">Not Verified On-Chain</span>;
    }
    if (rating === null) {
      return <span className="text-gray-400 text-sm">No Ratings Yet</span>;
    }
    return Array(5).fill(0).map((_, index) => (
      <FaStar 
        key={index} 
        className={`text-xl ${index < rating ? 'text-yellow-400' : 'text-gray-600'}`} 
      />
    ));
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (!article) return <div className="text-white">Article not found</div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-block mb-4 text-white hover:text-gray-300 transition-colors">
          <FaArrowLeft className="inline-block mr-2" />
          Back to Homepage
        </Link>
        <article className="bg-gray-800 rounded-lg shadow-md p-6">
          {article.url_to_image && (
            <div className="mb-6 relative w-full h-64">
              <Image
                src={article.url_to_image}
                alt={article.title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4 text-white">{article.title}</h1>
          <p className="text-gray-400 mb-4">
            <FaUser className="inline-block mr-2" />
            {article.author} | 
            <FaCalendarAlt className="inline-block mx-2" />
            {new Date(article.publishedAt).toLocaleDateString()}
          </p>
          <div className="flex items-center mb-4">
            <span className="text-gray-300 mr-2">On-Chain Rating:</span>
            {renderStars()}
          </div>
          {article.source_url && (
            <p className="text-blue-400 mb-4">
              <FaLink className="inline-block mr-2" />
              <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                Source URL
              </a>
            </p>
          )}
          <div className="prose max-w-none text-gray-300">
            <p>{article.description}</p>
            {expandedDescription && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2 text-white">
                  <FaInfoCircle className="inline-block mr-2" />
                  Extended Description:
                </h3>
                <p>{expandedDescription}</p>
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
