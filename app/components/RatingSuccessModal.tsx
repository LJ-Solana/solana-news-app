import React from 'react';
import { FaStar } from 'react-icons/fa';

interface RatingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  rating: number;
  transactionHash: string;
}

const RatingSuccessModal: React.FC<RatingSuccessModalProps> = ({ isOpen, onClose, title, rating, transactionHash }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-3 sm:p-6 w-full max-w-[90vw] sm:max-w-md overflow-y-auto">
        <div className="flex flex-col items-center justify-center mb-2 sm:mb-4">
          <FaStar className="text-yellow-500 text-xl sm:text-4xl mb-1 sm:mb-2" />
          <h2 className="text-base sm:text-2xl font-bold text-gray-200 text-center">Rating Submitted!</h2>
        </div>
        <p className="text-center mb-2 sm:mb-4 text-gray-300 text-xs sm:text-base">
          You successfully rated &ldquo;{title}&rdquo; with {rating} stars.
        </p>
        <div className="mb-3 sm:mb-6">
          <p className="font-semibold text-gray-200 text-xs sm:text-base flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="#00FFA3"/>
              <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="#00FFA3"/>
              <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="#00FFA3"/>
            </svg>
            Transaction:
          </p>
          <a href={`https://solana.fm/tx/${transactionHash}?cluster=devnet-solana`} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm break-all text-blue-400 hover:text-blue-300 underline">
            {transactionHash}
          </a>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 sm:py-2 px-4 rounded transition duration-300 text-xs sm:text-base"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RatingSuccessModal;