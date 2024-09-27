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
import InfoIcon from '@mui/icons-material/Info';
import CommentBox from '../../components/commentBox';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { verifyArticle } from '../../lib/articleVerification';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import RatingInformationModal from '../../components/RatingInformationModal';

export default function ArticlePage() {
  const { slug } = useParams();
  const router = useRouter();
  const wallet = useWallet();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDescription, setExpandedDescription] = useState<string[] | null>(null);
  const [lastExpandTime, setLastExpandTime] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifier, setVerifier] = useState<string | undefined>(undefined);
  const [onChainVerification, setOnChainVerification] = useState<string | null>(null);
  const [showRatingInfo, setShowRatingInfo] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      if (typeof slug !== 'string') return;

      const { data, error } = await supabase
        .from('articles')
        .select('*, verified, verified_by, on_chain_verification')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
      } else {
        setArticle(data);
        expandDescription(data.description);
        setIsVerified(data.verified || data.on_chain_verification !== null);
        setVerifier(data.verified_by);
        setOnChainVerification(data.on_chain_verification);
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

  const handleVerification = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsVerifying(true);
    try {
      const message = `Verify article: ${slug}\nSource: ${article.source_url}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await wallet.signMessage!(encodedMessage);
      const base64Signature = Buffer.from(signatureBytes).toString('base64');

      const articleData = {
        title: article.title,
        content: article.description,
        source: article.source,
        sourceUrl: article.source_url,
        author: article.author,
        publishedAt: article.published_at,
        urlToImage: article.urlToImage ?? '',
        description: article.description,
        slug: article.slug,
      };

      const result = await verifyArticle(
        articleData,
        wallet.publicKey.toString(),
        base64Signature,
        wallet
      );

      if (result.success) {
        setIsVerified(true);
        // Fetch the updated article data
        const { data: updatedArticle, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching updated article:', error);
          toast.error('Failed to fetch updated article data');
        } else if (updatedArticle) {
          setArticle(updatedArticle);
          toast.success('Article verified successfully');
        } else {
          console.warn('Updated article not found');
          toast.warning('Article verified, but updated data not found');
        }
      } else {
        console.error('Verification failed:', result.message);
        toast.error(`Verification failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error during verification:', error);
      toast.error('An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
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
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => router.push('/')} 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            <ArrowBackIcon className="mr-2" />
            Home
          </button>
          <WalletMultiButton />
        </div>
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
            onClick={() => handleVerification()}
            className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-md font-semibold transition duration-300 text-base sm:text-lg ${
              isVerified ? 'bg-blue-900 text-blue-300 cursor-not-allowed' : isVerifying ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-800 text-blue-200 hover:bg-blue-700'
            }`}
            disabled={isVerified || isVerifying}
          >
            {isVerified ? (
              <>
                <FaCheckCircle className="inline-block mr-2" />
                Verified
              </>
            ) : isVerifying ? (
              'Verifying...'
            ) : (
              <>
                Contribute 0.1
                <Image src="/stakeSOL-logo.png" alt="USDC Logo" width={16} height={16} className="inline-block ml-2 align-text-bottom" />
              </>
            )}
          </button>
          <button
            onClick={handleRateArticle}
            className="flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-md font-semibold transition duration-300 text-base sm:text-lg bg-yellow-800 text-yellow-200 hover:bg-yellow-700 flex items-center justify-center"
            disabled={!isVerified}
          >
            <StarIcon className="mr-2" />
            <span>Rate Contribution</span>
          </button>
        </div>
        {/* Add this new section for verification info */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              {isVerified ? (
                <span className="text-green-400 flex items-center">
                  <FaCheckCircle className="mr-2" /> 
                  Verified by {verifier ? `${verifier.slice(0, 4)}...${verifier.slice(-4)}` : 'Unknown'}
                </span>
              ) : (
                <span className="text-red-400 flex items-center">
                  <FaTimesCircle className="mr-2" /> Unverified
                </span>
              )}
            </div>
            {isVerified && onChainVerification && (
              <a 
                href={`https://solana.fm/tx/${onChainVerification}?cluster=devnet-solana`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-pink-400 hover:text-pink-300 underline"
              >
                On-Chain Tx: {`${onChainVerification.slice(0, 4)}...${onChainVerification.slice(-4)}`}
              </a>
            )}
          </div>
        </div>
        <hr className="border-t border-gray-700 my-6" />
        <div className="prose prose-lg max-w-none text-gray-300 mb-12">
          <div className="mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 justify-between flex items-center">
              <div className="flex items-center">
                <HandshakeIcon className="mr-2 text-blue-400" />
                <span>Contribution</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">How it Works</span>
                <InfoIcon 
                  className="text-blue-400 cursor-pointer h-6 w-6" 
                  onClick={() => setShowRatingInfo(true)}
                />
              </div>
            </h3>
            <RatingInformationModal isOpen={showRatingInfo} onClose={() => setShowRatingInfo(false)} />
            {article.contribution ? (
              <p className="text-base sm:text-lg leading-relaxed">{article.contribution}</p>
            ) : (
              <>
                <p className="text-base sm:text-lg leading-relaxed mb-4">
                  Article not yet verified. Add a contribution now with the button above. ☝️
                </p>
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <InfoIcon className="text-blue-400 mr-3" />
                    <h4 className="text-lg font-semibold text-blue-200">Contribution Process</h4>
                  </div>
                  <ul className="list-disc list-inside text-blue-100 space-y-2">
                    <li>Contributing requires a deposit of 0.1 NEWS token into escrow.</li>
                    <li>Receive your deposit back plus a token reward if your average rating exceeds 3.5.</li>
                    <li>Risk up to 10% of your deposit for contributions scoring under 3.5.</li>
                  </ul>
                </div>
              </>
            )}
        </div>
        <hr className="border-t border-gray-700 my-6" />
        <div className="mb-4">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <ShowChartIcon className="mr-2 text-yellow-400" />
                <span>On-Chain Score</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">How it Works</span>
                <InfoIcon 
                  className="text-blue-400 cursor-pointer h-6 w-6" 
                  onClick={() => setShowRatingInfo(!showRatingInfo)}
                />
              </div>
            </h3>
            <div className="flex flex-col items-center mt-16 mb-8">
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={` ${
                      star <= (article.averageRating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-400'
                    }`}
                    style={{ width: '64px', height: '64px' }}
                  />
                ))}
              </div>
              <span className="text-xl flex items-center">
                {article.averageRating ? (
                  article.averageRating.toFixed(1)
                ) : (
                  <>
                    <FaTimesCircle className="text-red-500 mr-2" />
                    <span className="text-red-500">Not rated yet</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-base sm:text-lg items-center text-center leading-relaxed mb-4">
              This score represents the average rating given by contributors.
            </p>
            <hr className="border-t border-gray-700 mt-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
            <SmartToyIcon className="mr-2 text-green-400" />
            <span>AI Fact Check</span>
        </h3>
        {!expandedDescription ? (
          <div className="flex items-center justify-center mb-8">
            <div className="animate-pulse">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <span className="text-xl ml-4">Computing AI Fact Check...</span>
          </div>
        ) : (
          <div className="mb-8">
            {expandedDescription.map((paragraph, index) => (
              <p key={index} className="mb-4 text-lg sm:text-xl leading-relaxed">{paragraph}</p>
            ))}
          </div>
        )}
        </div>
        <CommentBox articleId={article.id} />
      </main>
      <footer className="bg-gradient-to-r from-gray-900 to-black text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">Byte News</h3>
              <p className="text-gray-400">Open Source for Cutting-Edge Updates.</p>
            </div>
            <div className="w-full md:w-1/3">
              <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for daily byte-sized updates.</p>
              <div className="flex">
                <input type="email" placeholder="Enter your email" className="bg-gray-800 text-gray-200 px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-md transition duration-300">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center text-gray-500">
            <p>&copy; 2024 Byte News. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
