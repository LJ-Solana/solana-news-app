import React, { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaStar } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { useWallet } from '@solana/wallet-adapter-react';
import { rateContent } from '../lib/rateVerification';
import RatingSuccessModal from './RatingSuccessModal';


interface RateContributionModalProps {
  isVisible: boolean;
  onClose: () => void;
  articleTitle: string;
  articleDescription: string;
  articleSource: { name: string };
  articleSourceUrl: string;
}

const RateContributionModal: React.FC<RateContributionModalProps> = ({
  isVisible,
  onClose,
  articleTitle,
  articleDescription,
}) => {
  const [rating, setRating] = useState(0);
  const [verificationData, setVerificationData] = useState('');
  const wallet = useWallet();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  useEffect(() => {
    const fetchVerificationData = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('verification_data')
        .eq('title', articleTitle)
        .single();

      if (error) {
        console.error('Error fetching verification data:', error);
      } else if (data) {
        setVerificationData(data.verification_data);
      }
    };

    fetchVerificationData();
  }, [articleTitle]);

  if (!isVisible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    try {
      const articleData = {
        title: articleTitle,
        description: articleDescription,
      };
      const result = await rateContent(articleData, rating, wallet);
      setTransactionHash(result);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting rating:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-4 sm:p-8 rounded-lg max-w-3xl w-full h-[90vh] sm:h-[75vh] overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-200 transition-colors duration-200"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-6 flex items-center text-gray-200">
            <FaInfoCircle className="mr-2 sm:mr-3 text-blue-400" />
            Rate Source Contribution
          </h2>
          <p className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-300">{articleTitle}</p>
          <p className="text-sm sm:text-md text-gray-400 mb-3 sm:mb-6">
            Please rate the quality and accuracy of this contributions source&apos;s.
          </p>
          <div className="bg-gray-700 border-l-4 border-blue-500 text-gray-300 p-3 sm:p-6 mb-3 sm:mb-6 rounded-r">
            <p className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Contribution:</p>
            {verificationData && (
              <p className="text-sm sm:text-base break-words overflow-hidden">
                <p className="text-blue-400">
                  {verificationData}
                </p>
              </p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`cursor-pointer text-3xl ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-600'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <div className="flex justify-end space-x-2 sm:space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors duration-200 text-gray-200 font-semibold text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200 font-semibold text-sm sm:text-base"
              >
                Submit Rating
              </button>
            </div>
          </form>
        </div>
      </div>
      <RatingSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        title={articleTitle}
        rating={rating}
        transactionHash={transactionHash}
      />
    </>
  );
};

export default RateContributionModal;
