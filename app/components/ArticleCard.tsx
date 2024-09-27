import React, { useState, useEffect, useCallback, memo } from 'react';
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
import { getSolanaProgram, initializeSolanaProgram } from '../lib/solanaClient';
import { Program, Idl, } from '@project-serum/anchor';
import { toast } from 'react-toastify';

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
  urlToImage: string | null;
  featured?: boolean;
  verifiedBy?: string;
  summary?: string;
  source_url: string;
  onChainVerification: string | null;
  onUpdate?: (updatedArticle: ArticleCardProps) => void;
}

const ensureAbsoluteUrl = (url: string) => {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  return url;
};

const ArticleCard: React.FC<ArticleCardProps> = memo(({ 
  slug,
  title, 
  description, 
  author, 
  publishedAt, 
  source, 
  category, 
  icon, 
  urlToImage,
  source_url,
  featured = false,
  onUpdate,
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
  const [isProgramInitialized, setIsProgramInitialized] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sourceData, setSourceData] = useState<string | null>(null);

  useEffect(() => {
    const initializeProgram = async () => {
      if (wallet.connected && wallet.publicKey) {
        try {
          await initializeSolanaProgram(wallet);
          setIsProgramInitialized(true);
        } catch (error) {
          console.error('Failed to initialize Solana program:', error);
        }
      }
    };

    initializeProgram();
  }, [wallet.connected, wallet.publicKey, wallet]);

  const fetchVerificationStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('verified, verified_by, signature, on_chain_verification, verification_data')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsVerified(data.verified || data.on_chain_verification !== null);
        setVerifier(data.verified_by);
        setSignature(data.signature);
        setOnChainVerification(data.on_chain_verification);
        setSourceData(data.verification_data);
      } else {
        console.log('Article not found');
        setIsVerified(false);
        setVerifier(undefined);
        setSignature(null);
        setOnChainVerification(null);
        setSourceData(null);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
      setIsVerified(false);
      setVerifier(undefined);
      setSignature(null);
      setOnChainVerification(null);
      setSourceData(null);
    }
  }, [slug]);

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  const handleSourceDataSubmit = async (submittedSourceData: string) => {
    setSourceData(submittedSourceData);
    await handleVerification(submittedSourceData);
  };

  const handleVerification = async (submittedSourceData: string) => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsVerifying(true);
    try {
      const message = `Verify article: ${slug}\nSource: ${submittedSourceData}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await wallet.signMessage!(encodedMessage);
      const base64Signature = Buffer.from(signatureBytes).toString('base64');

      const articleData = {
        title,
        content: description,
        source: source,
        sourceUrl: source_url,
        author,
        publishedAt,
        urlToImage: urlToImage ?? '',
        description,
        slug,
      };

      const result = await verifyArticle(
        articleData,
        wallet.publicKey.toString(),
        base64Signature,
        wallet
      );

      if (result.success) {
        // Update the existing article record in Supabase
        const { data: updatedArticle, error: updateError } = await supabase
          .from('articles')
          .update({
            verified: true,
            verified_by: wallet.publicKey.toString(),
            signature: base64Signature,
            on_chain_verification: result.onChainSignature, 
            verified_at: Math.floor(Date.now() / 1000),
            verification_data: submittedSourceData 
          })
          .eq('slug', slug)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating article:', updateError);
          toast.error('Failed to update article data');
        } else if (updatedArticle) {
          setIsVerified(true);
          if (onUpdate && typeof onUpdate === 'function') {
            onUpdate(updatedArticle);
          }
          toast.success('Article verified successfully');
        } else {
          console.warn('Article not found or not updated');
          toast.warning('Verification recorded, but article data not updated');
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

  useEffect(() => {
    const fetchRatings = async () => {
      if (wallet.connected && wallet.publicKey && onChainVerification && isProgramInitialized) {
        try {
          const program = getSolanaProgram();
          const contentHash = generateContentHash({title, description});
          const contentPDA = getPDAFromContentHash(contentHash);
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

    fetchRatings();
  }, [wallet.connected, wallet.publicKey, onChainVerification, title, description, isProgramInitialized]);

  const renderStars = useCallback(() => {
    if (!onChainVerification) {
      return <span className="text-gray-400 text-xs">Not Verified On-Chain</span>;
    }
    if (rating === null) {
      return <span className="text-gray-400 text-xs">No Ratings Yet</span>;
    }
    return Array(5).fill(0).map((_, index) => (
      <FaStar 
        key={index} 
        className={`text-xl ${index < rating ? 'text-yellow-400' : 'text-gray-600'}`} 
      />
    ));
  }, [onChainVerification, rating]);

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-xlg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-700 flex flex-col h-full">
          <div className="relative w-full h-48">
            <Image
              src={!imageError && urlToImage ? ensureAbsoluteUrl(urlToImage) : '/placeholder-image.png'}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              onError={() => setImageError(true)}
            />
          </div>
          <div className="p-4 space-y-3 flex-grow">
            <h2 className={`font-bold ${featured ? 'text-xl' : 'text-lg'} leading-tight text-gray-100`}>{title}</h2>
            <p className="text-sm text-gray-300 line-clamp-2">{description}</p>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span className="flex items-center"><FaUser className="mr-1 text-blue-400" /> {author}</span>
              <span className="flex items-center"><FaCalendar className="mr-1 text-green-600" /> {new Date(publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-300">⛓️ On-Chain Score: </span>
              <div className="flex items-center">
                {renderStars()}
              </div>
            </div>
            <div className="text-xs text-gray-300 flex items-center justify-between">
              <span>Source: {source_url}</span>
              <span>{icon && typeof icon === 'string' ? icon : null} {category}</span>
            </div>
            <div className="text-xs flex justify-between mt-2">
              <div className="flex flex-col">
                {isVerified ? (
                  <span className="text-green-400 flex items-center">
                    <FaCheckCircle className="mr-1" /> 
                    Verified by {verifier ? `${verifier.slice(0, 4)}...${verifier.slice(-4)}` : 'Unknown'}
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center">
                    <FaTimesCircle className="mr-1" /> Unverified
                  </span>
                )}
              </div>
              <div className="flex flex-col text-right">
                {isVerified && onChainVerification ? (
                  <a href={`https://solana.fm/tx/${onChainVerification}?cluster=devnet-solana`} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 underline">
                    Signature: {`${onChainVerification.slice(0, 4)}...${onChainVerification.slice(-4)}`}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        <div className="px-4 pb-4 mt-auto flex flex-col space-y-2">
          <Link href={`/article/${slug}`} className="w-full">
            <button className="w-full py-2 rounded-md text-purple-400 font-medium transition duration-300 bg-purple-900 hover:bg-purple-800 text-base">
              Read Summary
            </button>
          </Link>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowSourceDataModal(true)}
              className={`flex-1 py-1.5 px-3 rounded-md font-medium transition duration-300 text-sm ${
                isVerified ? 'bg-blue-900 text-blue-300 cursor-not-allowed' : isVerifying ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
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
                className="flex-1 py-1.5 px-3 rounded-md font-medium transition duration-300 text-sm bg-yellow-900 text-yellow-300 hover:bg-yellow-800 flex items-center justify-center"
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
          onSubmit={handleSourceDataSubmit}
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
});

ArticleCard.displayName = 'ArticleCard';

export default ArticleCard;