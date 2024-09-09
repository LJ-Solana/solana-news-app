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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-3xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Close"
        >
          <FaTimes size={24} />
        </button>
        <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800">
          <FaInfoCircle className="mr-3 text-blue-500" />
          Verify Article
        </h2>
        <p className="text-xl font-semibold mb-4 text-gray-700">{articleTitle}</p>
        <p className="text-md text-gray-600 mb-6">
          Please provide clear and accurate information to help verify this specific article.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-6 mb-6 rounded-r">
          <p className="font-bold text-lg mb-3">Instructions:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide the original source URLs</li>
            <li>Include any additional sources that corroborate the information</li>
            <li>Add any relevant notes or observations about the article&apos;s content</li>
            <li>If possible, mention the author&apos;s credentials or reputation</li>
          </ul>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            className="w-full p-4 border rounded-lg mb-4 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            rows={8}
            value={sourceData}
            onChange={(e) => setSourceData(e.target.value)}
            placeholder="Enter verification data (e.g., source URL, additional sources, notes)"
            required
          />
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-gray-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold"
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
