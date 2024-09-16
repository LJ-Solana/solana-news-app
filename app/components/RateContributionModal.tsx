import React, { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaStar } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';

interface RateContributionModalProps {
  isVisible: boolean;
  onClose: () => void;
  articleTitle: string;
  articleDescription: string;
  articleSource: {
    name: string;
    [key: string]: string | number;
  };
  articleSourceUrl: string;
}

const RateContributionModal: React.FC<RateContributionModalProps> = ({
  isVisible,
  onClose,
  articleTitle,
  articleSource,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  useEffect(() => {
    const fetchSourceUrl = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('source_url')
        .eq('title', articleTitle)
        .single();

      if (error) {
        console.error('Error fetching source URL:', error);
      } else if (data) {
        setSourceUrl(data.source_url);
      }
    };

    fetchSourceUrl();
  }, [articleTitle]);

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement rating submission logic
    console.log('Rating:', rating, 'Comment:', comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 sm:p-8 rounded-lg max-w-3xl w-full h-[90vh] sm:h-[75vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-6 flex items-center text-gray-800">
          <FaInfoCircle className="mr-2 sm:mr-3 text-blue-500" />
          Rate Source Contribution
        </h2>
        <p className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-700">{articleTitle}</p>
        <p className="text-sm sm:text-md text-gray-600 mb-3 sm:mb-6">
          Please rate the quality and accuracy of this contributions source&apos;s.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-3 sm:p-6 mb-3 sm:mb-6 rounded-r">
          <p className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Note: {articleSource.name}</p>
          {sourceUrl && (
            <p className="text-sm sm:text-base">
             {sourceUrl}
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`cursor-pointer text-3xl ${
                  star <= rating ? 'text-yellow-500' : 'text-gray-300'
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <textarea
            className="w-full p-2 sm:p-4 border rounded-lg mb-2 sm:mb-4 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
            rows={6}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment about this source's contribution (optional)"
          />
          <div className="flex justify-end space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-gray-800 font-semibold text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold text-sm sm:text-base"
            >
              Submit Rating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateContributionModal;
