import React from 'react';

interface NewsTokenPopupProps {
  onClose: () => void;
}

const NewsTokenPopup: React.FC<NewsTokenPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl text-gray-200 relative w-full max-w-md">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-200 transition duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">News Token: Powering Our Protocol</h2>
        <div className="bg-gray-700 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <p className="text-base sm:text-lg font-semibold mb-2">The News Token is essential for our protocol:</p>
          <ul className="list-none space-y-2">
            <li className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-sm sm:text-base">Incentivizes quality contributions</span>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-sm sm:text-base">Enables community-driven content moderation</span>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-sm sm:text-base">Grants voting rights for protocol governance</span>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-sm sm:text-base">Each wallet requires a minimum of 0.25 tokens to access and rate content</span>
            </li>
          </ul>
        </div>
        <p className="text-base sm:text-lg mb-4 sm:mb-6">Hold at least <span className="font-bold text-yellow-400">0.25 News Tokens</span> to fully participate in our ecosystem:</p>
        <div className="flex justify-center">
          <a 
            href="https://jup.ag/swap/SOL-st8QujHLPsX3d6HG9uQg9kJ91jFxUgruwsb1hyYXSNd" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full transition duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Buy News Token on Jupiter
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsTokenPopup;