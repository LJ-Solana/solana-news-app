import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  verifier: string;
  signature: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, title, verifier, signature }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-3 sm:p-6 w-full max-w-[90vw] sm:max-w-md overflow-y-auto h-[75vh] sm:h-[75vh]">
        <div className="flex flex-col items-center justify-center mb-2 sm:mb-4">
          <FaCheckCircle className="text-green-500 text-xl sm:text-4xl mb-1 sm:mb-2" />
          <h2 className="text-base sm:text-2xl font-bold text-gray-800 text-center">Article Verified!</h2>
        </div>
        <p className="text-center mb-2 sm:mb-4 text-gray-700 text-xs sm:text-base">
          The article &ldquo;{title}&rdquo; has been successfully verified.
        </p>
        <div className="mb-2 sm:mb-4">
          <p className="font-semibold text-gray-800 text-xs sm:text-base">Verified by:</p>
          <p className="text-xs sm:text-sm break-all text-gray-700">{verifier}</p>
        </div>
        <div className="mb-3 sm:mb-6">
          <p className="font-semibold text-gray-800 text-xs sm:text-base">Signature:</p>
          <p className="text-xs sm:text-sm break-all text-gray-700">{signature}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 sm:py-2 px-4 rounded transition duration-300 text-xs sm:text-base"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VerificationModal;
