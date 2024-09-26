'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '../../lib/supabaseClient';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StarIcon from '@mui/icons-material/Star';

export default function ArticlePage() {
  const { slug } = useParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDescription, setExpandedDescription] = useState<string[] | null>(null);
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
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
      }

      const data = await response.json();
      if (!data.expandedDescription) {
        throw new Error('Expanded description not found in response');
      }

      setExpandedDescription(data.expandedDescription.split('\n\n'));
      setLastExpandTime(Date.now());
    } catch (error) {
      console.error('Detailed error expanding description:', error);
      setExpandedDescription(['Failed to load AI Fact Check. Please try again later.']);
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white font-sans">
      <div className="text-center">
        <div className="text-4xl mb-4">📰🔍</div>
        <div className="text-xl">Loading article...</div>
        <div className="mt-4 animate-spin">⏳</div>
      </div>
    </div>
  );
  if (!article) return <div className="text-white font-sans">Article not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center mb-8 text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          <ArrowBackIcon className="mr-2" />
          Back
        </button>
        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">{article.title}</h1>
        <div className="border-t border-b border-gray-700 py-4 mb-8">
          <div className="text-gray-400 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center mb-2 sm:mb-0">
              <PersonIcon className="mr-2 text-gray-300" />
              <span className="font-semibold">{article.author}</span>
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="flex items-center mb-2 sm:mb-0 sm:mr-4">
                <CalendarTodayIcon className="mr-2 text-gray-300" />
                <span>{article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not available'}</span>
              </span>
              {article.source_url && (
                <span className="flex items-center">
                  <LinkIcon className="mr-2 text-blue-300" />
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-medium">
                    Source URL
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>
        {article.url_to_image && (
          <div className="mb-8 relative w-full h-48 sm:h-64 md:h-96">
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
            className="flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-md font-semibold transition duration-300 text-base sm:text-lg bg-blue-800 text-blue-200 hover:bg-blue-700"
          >
            <>
              Contribute 0.1
              <Image src="/stakeSOL-logo.png" alt="USDC Logo" width={16} height={16} className="inline-block ml-2 align-text-bottom" />
            </>
          </button>
          <button
            onClick={handleRateArticle}
            className="flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-md font-semibold transition duration-300 text-base sm:text-lg bg-yellow-800 text-yellow-200 hover:bg-yellow-700 flex items-center justify-center"
          >
            <StarIcon className="mr-2" />
            <span>Rate Contribution</span>
          </button>
        </div>
        <div className="prose prose-lg max-w-none text-gray-300 mb-12">
          <div className="mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
              <HandshakeIcon className="mr-2 text-blue-400" />
              <span>Contribution</span>
            </h3>
            {article.contribution ? (
              <p className="text-base sm:text-lg leading-relaxed">{article.contribution}</p>
            ) : (
              <>
                <p className="text-base sm:text-lg leading-relaxed mb-4">
                  Article not yet verified. Add a contribution now with the button above. ☝️
                </p>
                <div className="bg-blue-900 border-l-4 border-blue-500 text-blue-100 p-4 mb-4 rounded">
                  <p className="text-md sm:text-lg">
                    <strong>Note:</strong> Contributing requires a deposit of 0.1 NEWS token into escrow. 
                    You&apos;ll receive this back as well as a token reward if the average rating for your contribution exceeds 3.5.
                  </p>
                </div>
              </>
            )}
        </div>
        <div className="mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
              <ShowChartIcon className="mr-2 text-yellow-400" />
              <span>On-Chain Score</span>
            </h3>
            {/* Add on-chain score content here */}
        </div>
       
          {expandedDescription && (
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
                <SmartToyIcon className="mr-2 text-green-400" />
                <span>AI Fact Check</span>
              </h3>
              {expandedDescription.map((paragraph, index) => (
                <p key={index} className="mb-4 text-base sm:text-lg leading-relaxed">{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
