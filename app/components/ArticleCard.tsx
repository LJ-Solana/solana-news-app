import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaCalendar, FaCheckCircle, FaTimesCircle, FaStar } from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';
import VerificationModal from '../components/VerificationModal';
import SourceDataModal from '../components/SourceDataModal';
import RateContributionModal from '../components/RateContributionModal';
import { supabase } from '../lib/supabaseClient';
import { verifyArticle } from '../lib/articleVerification';
import AlertPopup from './AlertPopUp';
import { queryContentRatings } from '../lib/queryContentRatings';
import { getPDAFromContentHash, generateContentHash } from '../lib/articleVerification';
import { getProgram } from '../lib/solanaClient';

export interface ArticleCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  source: {
    name: string;
    [key: string]: string | number; 
  };
  category: string;
  icon: string;
  url_to_image: string | null;
  featured?: boolean;
  verifiedBy?: string;
  summary?: string;
  source_url: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  slug,
  title, 
  description, 
  author, 
  publishedAt, 
  source, 
  category, 
  icon, 
  url_to_image,
  source_url,
  featured = false,
}) => {
  const [isVerified, setIsVerified] = useState(false);
  const [verifier, setVerifier] = useState<string | undefined>(undefined);
  const [signature, setSignature] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSourceDataModal, setShowSourceDataModal] = useState(false);
  const [showRateContributionModal, setShowRateContributionModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const wallet = useWallet();
  const [onChainVerification, setOnChainVerification] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [rating, setRating] = useState<number | null>(null); 

  const fetchVerificationStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('verified, verified_by, signature, on_chain_verification')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsVerified(data.verified || data.on_chain_verification !== null);
        setVerifier(data.verified_by);
        setSignature(data.signature);
        setOnChainVerification(data.on_chain_verification);
      } else {
        console.log('Article not found');
        setIsVerified(false);
        setVerifier(undefined);
        setSignature(null);
        setOnChainVerification(null);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
      setIsVerified(false);
      setVerifier(undefined);
      setSignature(null);
      setOnChainVerification(null);
    }
  }, [slug]);

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  const handleVerification = async (sourceData: string) => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      setAlert({ message: 'Wallet not connected or missing required properties', type: 'error' });
      return;
    }

    setIsVerifying(true);

    try {
      const message = `Verify article: ${slug}\nSource: ${sourceData}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await wallet.signMessage(encodedMessage);
      const base64Signature = Buffer.from(signatureBytes).toString('base64');
      const walletAddress = wallet.publicKey.toBase58();

      const result = await verifyArticle(
        slug,
        walletAddress,
        base64Signature,
        {
          title,
          content: description,
          sourceUrl: sourceData,
          author,
          description,
          publishedAt,
          urlToImage: url_to_image || ''
        },
        wallet
      );

      if (result.success) {
        await fetchVerificationStatus();
        setShowModal(true);
        setAlert({ message: 'Article verified successfully', type: 'success' });
      } else {
        setAlert({ message: `Verification failed: ${result.message}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error verifying article:', error);
      setAlert({ message: 'An error occurred while verifying the article', type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  };

  const renderStars = () => {
    if (rating === null) {
      return <span className="text-gray-500 text-xs">Not Verified</span>;
    }
    return Array(5).fill(0).map((_, index) => (
      <FaStar 
        key={index} 
        className={`text-xl ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  useEffect(() => {
    const fetchRatings = async () => {
      if (wallet.connected && wallet.publicKey) {
        const program = getProgram();
        const contentHash = generateContentHash({ title, content: description });
        const contentPDA = getPDAFromContentHash(contentHash);
        try {
          const { averageRating } = await queryContentRatings(program, contentPDA);
          setRating(averageRating);
        } catch (error) {
          console.error('Error fetching rating:', error);
          setRating(null);
        }
      }
    };

    fetchRatings();
  }, [wallet.connected, wallet.publicKey, title, description]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-xlg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col h-full">
        <Link href={`/article/${slug}`} className="block flex-grow">
          <div className="relative w-full h-48">
            <Image
              src={!imageError && url_to_image ? url_to_image : '/placeholder-image.png'}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              onError={() => setImageError(true)}
            />
          </div>
          <div className="p-4 space-y-3 flex-grow">
            <h2 className={`font-bold ${featured ? 'text-xl' : 'text-lg'} leading-tight text-gray-800`}>{title}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span className="flex items-center"><FaUser className="mr-1" /> {author}</span>
              <span className="flex items-center"><FaCalendar className="mr-1" /> {new Date(publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-600">On-Chain Score:</span>
              <div className="flex items-center">
                {renderStars()}
              </div>
            </div>
            <div className="text-xs text-gray-600 flex items-center justify-between">
              <span>Source: {source && typeof source === 'object' && 'name' in source ? source.name : 'Unknown'}</span>
              <span>{icon} {category}</span>
            </div>
            <div className="text-xs flex justify-between mt-2">
              <div className="flex flex-col">
                {isVerified ? (
                  <span className="text-green-600 flex items-center">
                    <FaCheckCircle className="mr-1" /> 
                    Verified by {verifier ? `${verifier.slice(0, 4)}...${verifier.slice(-4)}` : 'Unknown'}
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <FaTimesCircle className="mr-1" /> Unverified
                  </span>
                )}
              </div>
              <div className="flex flex-col text-right">
                {isVerified && onChainVerification ? (
                  <a href={`https://solana.fm/tx/${onChainVerification}?cluster=devnet-solana`} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 underline">
                    Signature: {`${onChainVerification.slice(0, 4)}...${onChainVerification.slice(-4)}`}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </Link>
        <div className="px-4 pb-4 mt-auto flex flex-col space-y-2">
          <Link href={`/article/${slug}`} className="w-full">
            <button className="w-full py-2 rounded-md text-purple-600 font-medium transition duration-300 bg-purple-50 hover:bg-purple-100 text-base">
              Read Summary
            </button>
          </Link>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowSourceDataModal(true)}
              className={`flex-1 py-1.5 px-3 rounded-md font-medium transition duration-300 text-sm ${
                isVerified ? 'bg-blue-50 text-blue-600 cursor-not-allowed' : isVerifying ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
              disabled={isVerified || isVerifying}
            >
              {isVerified ? (
                <>
                  <FaCheckCircle className="inline-block mr-1" />
                  Verified
                </>
              ) : isVerifying ? (
                'Verifying...'
              ) : (
                <>
                  Contribute 0.1
                  <Image src="/stakeSOL-logo.png" alt="USDC Logo" width={16} height={16} className="inline-block ml-1 align-text-bottom" />
                </>
              )}
            </button>
            {isVerified && (
              <button
                onClick={() => setShowRateContributionModal(true)}
                className="flex-1 py-1.5 px-3 rounded-md font-medium transition duration-300 text-sm bg-yellow-50 text-yellow-600 hover:bg-yellow-100 flex items-center justify-center"
              >
                <FaStar className="mr-1" />
                <span>Rate Contribution</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {showSourceDataModal && (
        <SourceDataModal
          isOpen={showSourceDataModal}
          onClose={() => setShowSourceDataModal(false)}
          onSubmit={handleVerification}
          articleTitle={title}
          articleSlug={slug}
        />
      )}
      {showModal && (
        <VerificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={title}
          verifier={verifier || ''}
          signature={signature || ''}
          onChainVerification={onChainVerification || ''}
        />
      )}
      {showRateContributionModal && (
        <RateContributionModal
          isVisible={showRateContributionModal}
          onClose={() => setShowRateContributionModal(false)}
          articleTitle={title}
          articleDescription={description}
          articleSource={source}
          articleSourceUrl={source_url}
        />
      )}
      {alert && (
        <AlertPopup
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
};

export default ArticleCard;