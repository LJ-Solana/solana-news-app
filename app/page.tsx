"use client";

import React from 'react';
import Link from 'next/link';
import ArticleCard from './components/ArticleCard';
import { FaNewspaper, FaStar, FaClock, FaTrophy, FaUserCheck } from 'react-icons/fa';
import WalletButton from './components/WalletButton';
import { useNews, categories } from './lib/newsFetcher';

export default function Home() {
  const { featuredArticles, filteredArticles, selectedCategory, setSelectedCategory } = useNews();



  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between mb-4">
          <Link href="/verify-articles" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center">
            <FaUserCheck className="mr-2" /> Become a Verifier
          </Link>
          <div className="flex space-x-4">
            <Link href="/leaderboard" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center">
              <FaTrophy className="mr-2" /> Leaderboard
            </Link>
            <WalletButton />
          </div>
        </div>
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-green-400">Byte News</h1>
          <p className="text-xl text-gray-600">Your Byte-Sized <strong>Open Source</strong> for Cutting-Edge News</p>
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
            {featuredArticles.map((article, index) => (
              <ArticleCard key={index} {...article} featured={true} />
            ))}
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FaClock className="mr-2 text-blue-500" />
            {selectedCategory ? `${selectedCategory} Bytes` : 'Latest Bytes'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <ArticleCard 
                key={index} 
                {...article}
              />
            ))}
          </div>
        </section>
      </div>
      
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">Byte News</h3>
              <p className="text-gray-400">Delivering byte-sized tech and science updates, every day.</p>
            </div>
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">Quick Links</h3>
              <ul className="text-gray-400 space-y-2">
                <li><Link href="/" className="hover:text-white transition duration-300">Home</Link></li>
                <li><Link href="/categories" className="hover:text-white transition duration-300">Categories</Link></li>
                <li><Link href="/about" className="hover:text-white transition duration-300">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition duration-300">Contact</Link></li>
              </ul>
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
            <p>&copy; 2024 Byte News. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}