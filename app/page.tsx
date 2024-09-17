
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ArticleCard from './components/ArticleCard';
import { FaNewspaper, FaStar, FaClock, FaTrophy, FaUserCheck, FaChevronDown, FaCheckCircle } from 'react-icons/fa';
import WalletButton from './components/WalletButton';
import { categories } from './lib/serverNewsFetcher';
import { useNews } from './lib/useNews';
import USDCBalanceButton from './components/USDCBalanceButton';

export default function Home() {
  const { articles, featuredArticles, filteredArticles, selectedCategory, setSelectedCategory } = useNews();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const toggleActions = () => {
    setIsActionsOpen(!isActionsOpen);
  };

  const toggleVerifiedFilter = () => {
    setShowVerifiedOnly(!showVerifiedOnly);
  };

  const displayedArticles = showVerifiedOnly
    ? filteredArticles.filter(article => article.verifiedBy != null)
    : filteredArticles;

  console.log('Total articles:', articles.length); 

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-auto sm:flex-grow sm:mr-4">
            <button 
              onClick={toggleActions}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition duration-300 flex items-center justify-between w-full shadow-md relative z-50"
            >
              <span className="font-semibold text-base sm:text-lg">Actions</span>
              <FaChevronDown className={`ml-2 transition-transform duration-300 ${isActionsOpen ? 'transform rotate-180' : ''}`} />
            </button>
            <div className={`absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${isActionsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <Link href="/verify-articles" className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 transition duration-300 flex items-center">
                <FaUserCheck className="mr-2 sm:mr-3 text-lg sm:text-xl" /> <span className="font-medium text-sm sm:text-base">Become a Verifier</span>
              </Link>
              <Link href="/leaderboard" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 sm:px-6 py-2 sm:py-3 transition duration-300 flex items-center">
                <FaTrophy className="mr-2 sm:mr-3 text-lg sm:text-xl" /> <span className="font-medium text-sm sm:text-base">Leaderboard</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
            <USDCBalanceButton />
            <WalletButton />
          </div>
        </div>
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-green-400">Gulfstream Media</h1>
          <p className="text-xl text-gray-600">Your <strong>Open Source</strong> for Cutting-Edge News</p>
        </header> 
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FaNewspaper className="mr-2 text-green-500" />
            Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-4 w-full">
            {Object.entries(categories).map(([category, icon]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                className={`flex-grow px-6 py-3 rounded-full shadow-md font-semibold transition duration-300 cursor-pointer text-center text-lg ${
                  category === selectedCategory
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {icon} {category}
              </button>
            ))}
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FaStar className="mr-2 text-yellow-500" />
            Featured Bytes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map(article => (
              <ArticleCard key={article.id} {...article} featured={true} />
            ))}
          </div>
        </section>
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaClock className="mr-2 text-blue-500" />
              {selectedCategory ? `${selectedCategory} Bytes` : 'Latest Bytes'}
            </h2>
            <button
              onClick={toggleVerifiedFilter}
              className={`flex items-center px-4 py-2 rounded-full transition duration-300 ${
                showVerifiedOnly ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaCheckCircle className={`mr-2 ${showVerifiedOnly ? 'text-white' : 'text-green-500'}`} />
              <svg width="20" height="18" viewBox="0 0 101 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-2">
                <path d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.31074 87.2029 0.160416 86.8659C0.0100923 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0919944 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.408C17.5676 67.0306 18.0047 66.7295 18.4904 66.5234C18.9762 66.3172 19.5002 66.2104 20.0301 66.2095H99.0644C99.4415 66.2095 99.8104 66.3169 100.126 66.5183C100.441 66.7198 100.689 67.0067 100.84 67.3436C100.99 67.6806 101.036 68.0529 100.972 68.415C100.908 68.7771 100.737 69.1131 100.48 69.3817ZM83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2108 81.5055 33.1045 80.9743 33.1048H1.93563C1.55849 33.1048 1.18957 33.2121 0.874202 33.4136C0.558829 33.6151 0.31074 33.9019 0.160416 34.2388C0.0100923 34.5758 -0.0359181 34.9482 0.0280382 35.3103C0.0919944 35.6723 0.263131 36.0083 0.520422 36.277L17.2061 53.6968C17.5676 54.0742 18.0047 54.3752 18.4904 54.5814C18.9762 54.7875 19.5002 54.8944 20.0301 54.8952H99.0644C99.4415 54.8952 99.8104 54.7879 100.126 54.5864C100.441 54.3849 100.689 54.0981 100.84 53.7612C100.99 53.4242 101.036 53.0518 100.972 52.6897C100.908 52.3277 100.737 51.9917 100.48 51.723L83.8068 34.3032ZM1.93563 21.7905H80.9743C81.5055 21.7907 82.0312 21.6845 82.5185 21.4783C83.0058 21.2721 83.4444 20.9704 83.8068 20.592L100.48 3.17219C100.737 2.90357 100.908 2.56758 100.972 2.2055C101.036 1.84342 100.99 1.47103 100.84 1.13408C100.689 0.79713 100.441 0.510296 100.126 0.308823C99.8104 0.107349 99.4415 1.24074e-05 99.0644 0L20.0301 0C19.5002 0.000878397 18.9762 0.107699 18.4904 0.313848C18.0047 0.519998 17.5676 0.821087 17.2061 1.19848L0.524723 18.6183C0.267681 18.8866 0.0966198 19.2223 0.0325185 19.5839C-0.0315829 19.9456 0.0140624 20.3177 0.163856 20.6545C0.31365 20.9913 0.561081 21.2781 0.875804 21.4799C1.19053 21.6817 1.55886 21.7896 1.93563 21.7905Z" fill="url(#paint0_linear_174_4403)"/>
                <defs>
                <linearGradient id="paint0_linear_174_4403" x1="8.52558" y1="90.0973" x2="88.9933" y2="-3.01622" gradientUnits="userSpaceOnUse">
                <stop offset="0.08" stopColor="#9945FF"/>
                <stop offset="0.3" stopColor="#8752F3"/>
                <stop offset="0.5" stopColor="#5497D5"/>
                <stop offset="0.6" stopColor="#43B4CA"/>
                <stop offset="0.72" stopColor="#28E0B9"/>
                <stop offset="0.97" stopColor="#19FB9B"/>
                </linearGradient>
                </defs>
              </svg>
              Verified
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedArticles.map(article => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        </section>
      </div>
      
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">Gulfstream Media</h3>
              <p className="text-gray-400">Delivering byte-sized tech and science updates.</p>
            </div>
            <div className="w-full md:w-1/3">
              <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for daily byte-sized updates.</p>
              <div className="flex">
                <input type="email" placeholder="Enter your email" className="bg-gray-700 text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-r-md transition duration-300">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center text-gray-400">
            <p>&copy; 2024 Gulfstream Media. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}