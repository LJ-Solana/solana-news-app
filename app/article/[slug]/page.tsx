'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaLink, FaHandsHelping, FaRobot, FaChartLine, FaStar } from 'react-icons/fa';

export default function ArticlePage() {
  const { slug } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDescription, setExpandedDescription] = useState<string | null>(null);
  const [lastExpandTime, setLastExpandTime] = useState<number | null>(null);

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
        expandDescription(data.description);
      }
      setLoading(false);
    }
    fetchArticle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const expandDescription = async (description: string) => {
    const now = Date.now();
    if (lastExpandTime && now - lastExpandTime < 120000) {
      // If less than 2 minutes have passed, use the cached summary
      return;
    }

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
      setLastExpandTime(now);
    } catch (error) {
      console.error('Error expanding description:', error);
      setExpandedDescription(null);
    }
  };

  const handleVerifyArticle = () => {
    // TODO: Implement article verification logic
    console.log('Verify article clicked');
  };

  const handleRateArticle = () => {
    // TODO: Implement article rating logic
    console.log('Rate article clicked');
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (!article) return <div className="text-white">Article not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-block mb-8 text-blue-400 hover:text-blue-300 transition-colors">
          <FaArrowLeft className="inline-block mr-2" />
          Back to Homepage
        </Link>
        <h1 className="text-5xl font-bold mb-6 leading-tight">{article.title}</h1>
        <div className="border-t border-b border-gray-700 py-4 mb-8">
          <div className="text-gray-400 flex items-center justify-between">
            <span className="flex items-center">
              <FaUser className="mr-2 text-gray-300" />
              <span className="font-semibold">{article.author}</span>
            </span>
            <div className="flex items-center">
              <span className="flex items-center mr-4">
                <FaCalendarAlt className="mr-2 text-gray-300" />
                <span>{article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not available'}</span>
              </span>
              {article.source_url && (
                <span className="flex items-center">
                  <FaLink className="mr-2 text-blue-300" />
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    Source URL
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>
        {article.url_to_image && (
          <div className="mb-8 relative w-full h-96">
            <Image
              src={article.url_to_image}
              alt={article.title}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row w-full space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <button
            onClick={handleVerifyArticle}
            className="flex-1 py-4 px-6 rounded-md font-medium transition duration-300 text-lg bg-blue-800 text-blue-200 hover:bg-blue-700"
          >
            <>
              Contribute 0.1
              <Image src="/stakeSOL-logo.png" alt="USDC Logo" width={16} height={16} className="inline-block ml-2 align-text-bottom" />
            </>
          </button>
          <button
            onClick={handleRateArticle}
            className="flex-1 py-4 px-6 rounded-md font-medium transition duration-300 text-lg bg-yellow-800 text-yellow-200 hover:bg-yellow-700 flex items-center justify-center"
          >
            <FaStar className="mr-2" />
            <span>Rate Contribution</span>
          </button>
        </div>
        <div className="prose prose-lg max-w-none text-gray-300 mb-12">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 flex items-center">
              <FaHandsHelping className="mr-2 text-blue-400" />
              <span>Contribution</span>
            </h3>
            {article.contribution ? (
              <p>{article.contribution}</p>
            ) : (
              <p>Article not yet verified, add a contribution now with the button above. ☝️</p>
            )}
          </div>
        <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 flex items-center">
              <FaChartLine className="mr-2 text-yellow-400" />
              <span>On-Chain Score</span>
            </h3>
            {/* Add on-chain score content here */}
        </div>
       
          {expandedDescription && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <FaRobot className="mr-2 text-green-400" />
                <span>AI Summary</span>
              </h3>
              <p>{expandedDescription}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
