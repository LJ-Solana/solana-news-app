import React, { useState } from 'react';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';

interface SourceDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sourceData: string) => void;
  articleTitle: string;
  articleSlug: string;
}

const SourceDataModal: React.FC<SourceDataModalProps> = ({ isOpen, onClose, onSubmit, articleTitle }) => {
  const [sourceData, setSourceData] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(sourceData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
          Verify Article
        </h2>
        <p className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-300">{articleTitle}</p>
        <p className="text-sm sm:text-md text-gray-400 mb-3 sm:mb-6">
          Please provide clear and accurate information to help verify this specific article.
        </p>
        <div className="bg-gray-700 border-l-4 border-blue-500 text-gray-300 p-3 sm:p-6 mb-3 sm:mb-6 rounded-r">
          <p className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Instructions:</p>
          <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-sm sm:text-base">
            <li>Provide the original source URLs</li>
            <li>Include any additional sources that corroborate the information</li>
            <li>Add any relevant notes or observations about the article&apos;s content</li>
            <li>If possible, mention the author&apos;s credentials or reputation</li>
          </ul>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
          <textarea
            className="w-full p-2 sm:p-4 border rounded-lg mb-2 sm:mb-4 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
            rows={6}
            value={sourceData}
            onChange={(e) => setSourceData(e.target.value)}
            placeholder="Enter verification data (e.g., source URL, additional sources, notes)"
            required
          />
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
              Verify Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SourceDataModal;
