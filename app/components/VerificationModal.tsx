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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <FaCheckCircle className="text-green-500 text-4xl mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Article Verified!</h2>
        </div>
        <p className="text-center mb-4 text-gray-700">
          The article &ldquo;{title}&rdquo; has been successfully verified.
        </p>
        <div className="mb-4">
          <p className="font-semibold text-gray-800">Verified by:</p>
          <p className="text-sm break-all text-gray-700">{verifier}</p>
        </div>
        <div className="mb-6">
          <p className="font-semibold text-gray-800">Signature:</p>
          <p className="text-sm break-all text-gray-700">{signature}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VerificationModal;
