import React from 'react';
import { FaTimes, FaInfoCircle, FaStar } from 'react-icons/fa';

interface RatingInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RatingInformationModal: React.FC<RatingInformationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 sm:p-8 rounded-lg max-w-3xl w-full overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-200 transition-colors duration-200"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-6 flex items-center text-gray-200">
          <FaInfoCircle className="mr-2 sm:mr-3 text-blue-400" />
          On-Chain Rating System
        </h2>
        <p className="text-lg sm:text-xl text-gray-400 mb-3 sm:mb-6">
          Our on-chain rating system ensures transparency and immutability in the evaluation process:
        </p>
        <ul className="space-y-2 sm:space-y-4 mb-6">
          {[
            'Contributors rate articles based on quality, accuracy, and relevance.',
            'Ratings use a 1-5 star scale for consistency and ease of understanding.',
            'All ratings are stored directly on the Solana blockchain.',
            'The final score influences token rewards for both contributors and raters.',
            'Smart contracts manage the distribution of rewards based on ratings.'
          ].map((text, index) => (
            <li key={index} className="flex items-start">
              <FaStar className="text-yellow-500 mr-2 mt-1 flex-shrink-0" />
              <span className="text-lg sm:text-xl text-gray-300">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RatingInformationModal;
