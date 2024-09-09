import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  verifier: string;
  signature: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, title, verifier, signature }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  if (!isOpen) return null;

  const DesktopView = () => (
    <div className="bg-white rounded-lg p-6 w-full max-w-md overflow-y-auto max-h-[90vh]">
      <div className="flex flex-col items-center justify-center mb-4">
        <FaCheckCircle className="text-green-500 text-4xl mb-2" />
        <h2 className="text-2xl font-bold text-gray-800 text-center">Article Verified!</h2>
      </div>
      <p className="text-center mb-4 text-gray-700 text-base">
        The article &ldquo;{title}&rdquo; has been successfully verified.
      </p>
      <div className="mb-4">
        <p className="font-semibold text-gray-800 text-base">Verified by:</p>
        <p className="text-sm break-all text-gray-700">{verifier}</p>
      </div>
      <div className="mb-6">
        <p className="font-semibold text-gray-800 text-base">Signature:</p>
        <p className="text-sm break-all text-gray-700">{signature}</p>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 text-base"
      >
        Close
      </button>
    </div>
  );

  const MobileView = () => (
    <div className="bg-white rounded-lg p-3 w-full max-w-[85vw] overflow-y-auto max-h-[80vh]">
      <div className="flex flex-col items-center justify-center mb-2">
        <FaCheckCircle className="text-green-500 text-2xl mb-1" />
        <h2 className="text-base font-bold text-gray-800 text-center">Article Verified!</h2>
      </div>
      <p className="text-center mb-2 text-gray-700 text-xs">
        The article &ldquo;{title}&rdquo; has been verified.
      </p>
      <div className="mb-2">
        <p className="font-semibold text-gray-800 text-xs">Verified by:</p>
        <p className="text-xs break-all text-gray-700">{verifier}</p>
      </div>
      <div className="mb-3">
        <p className="font-semibold text-gray-800 text-xs">Signature:</p>
        <p className="text-xs break-all text-gray-700">{signature}</p>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded transition duration-300 text-xs"
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
};

export default VerificationModal;
