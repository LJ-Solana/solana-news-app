'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaLink, FaHandsHelping, FaRobot, FaChartLine, FaStar } from 'react-icons/fa';

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDescription, setExpandedDescription] = useState<string | null>(null);

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
  }, [slug]);

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
          <div className="flex flex-col sm:flex-row w-full space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <button
              onClick={handleVerifyArticle}
              className="flex-1 py-4 px-4 rounded-md font-medium transition duration-300 text-lg bg-blue-900 text-blue-300 hover:bg-blue-800"
            >
              <>
                Contribute 0.1
                <Image src="/stakeSOL-logo.png" alt="USDC Logo" width={16} height={16} className="inline-block ml-1 align-text-bottom" />
              </>
            </button>
            <button
              onClick={handleRateArticle}
              className="flex-1 py-4 px-4 rounded-md font-medium transition duration-300 text-lg bg-yellow-900 text-yellow-300 hover:bg-yellow-800 flex items-center justify-center"
            >
              <FaStar className="mr-1" />
              <span>Rate Contribution</span>
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">{article.title}</h1>
          <p className="text-gray-400 mb-4 flex items-center">
            <FaUser className="mr-2 text-gray-300" />
            <span>{article.author}</span>
            <span className="mx-2">|</span>
            <FaCalendarAlt className="mr-2 text-gray-300" />
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </p>
          {article.source_url && (
            <p className="text-blue-400 mb-4 flex items-center">
              <FaLink className="mr-2 text-blue-300" />
              <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                Source URL
              </a>
            </p>
          )}
          <div className="prose max-w-none text-gray-300">
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2 text-white flex items-center">
                  <FaHandsHelping className="mr-2" />
                  <span>Contribution:</span>
                </h3>
              </div>
          </div>
          <div className="prose max-w-none text-gray-300">
            {expandedDescription && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2 text-white flex items-center">
                  <FaRobot className="mr-2" />
                  <span>AI Extended Description:</span>
                </h3>
                <p>{expandedDescription}</p>
              </div>
            )}
          </div>
          <div className="prose max-w-none text-gray-300">
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2 text-white flex items-center">
                  <FaChartLine className="mr-2" />
                  <span>On-Chain Score:</span>
                </h3>
              </div>
          </div>
        </article>
      </main>
    </div>
  );
}
