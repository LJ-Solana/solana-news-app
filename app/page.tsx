import React from 'react';
import ArticleCard from './components/ArticleCard';
import { FaNewspaper, FaStar, FaClock } from 'react-icons/fa';
import WalletButton from './components/WalletButton';

const articles = [
  {
    slug: "decentralized-finance-reaches-new-milestone",
    title: "Decentralized Finance Reaches New Milestone",
    excerpt: "The total value locked in DeFi protocols surpasses $500 billion, marking a significant milestone in the adoption of blockchain-based financial services.",
    author: "Crypto Enthusiast",
    date: "Sept 2, 2024",
    category: "Blockchain",
    icon: "⛓️"
  },
  {
    slug: "breakthrough-in-quantum-computing",
    title: "Breakthrough in Quantum Computing",
    excerpt: "Scientists achieve new milestone in quantum supremacy, paving the way for revolutionary advancements in computing power and cryptography.",
    author: "Dr. Quantum",
    date: "Sept 8, 2024",
    category: "Technology",
    icon: "🖥️"
  },
  {
    slug: "ai-powered-climate-solutions-gain-traction",
    title: "AI-Powered Climate Solutions Gain Traction",
    excerpt: "Innovative AI algorithms are now being deployed to combat climate change, offering new hope in the fight against global warming.",
    author: "Eco Innovator",
    date: "Sept 7, 2024",
    category: "Environment",
    icon: "🌿"
  },
  {
    slug: "spacex-announces-mars-colony-plans",
    title: "SpaceX Announces Mars Colony Plans",
    excerpt: "Elon Musk reveals ambitious timeline for establishing the first human settlement on Mars, sparking excitement in the space community.",
    author: "Cosmic Explorer",
    date: "Sept 6, 2024",
    category: "Space",
    icon: "🚀"
  },
  {
    slug: "breakthrough-in-renewable-energy-storage",
    title: "Breakthrough in Renewable Energy Storage",
    excerpt: "Scientists develop a new type of battery that could solve the intermittency problem of renewable energy sources, potentially revolutionizing the green energy sector.",
    author: "Dr. Green",
    date: "Sept 5, 2024",
    category: "Energy",
    icon: "⚡"
  },
  {
    slug: "global-cybersecurity-pact-signed",
    title: "Global Cybersecurity Pact Signed",
    excerpt: "World leaders come together to sign a landmark cybersecurity agreement, aiming to combat the rising threat of cyber attacks and promote international cooperation.",
    author: "Cyber Guardian",
    date: "Sept 4, 2024",
    category: "Politics",
    icon: "🔒"
  },
  {
    slug: "revolutionary-cancer-treatment-shows-promise",
    title: "Revolutionary Cancer Treatment Shows Promise",
    excerpt: "A new immunotherapy approach demonstrates unprecedented success in early clinical trials, offering hope for patients with previously untreatable cancers.",
    author: "Dr. Cure",
    date: "Sept 3, 2024",
    category: "Health",
    icon: "🩺"
  }
];

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <WalletButton />
        </div>
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">Byte News</h1>
          <p className="text-xl text-gray-600">Your Byte-Sized, Open Source for Cutting-Edge Tech and Science Updates</p>
        </header>
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FaNewspaper className="mr-2 text-green-500" />
            Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-4 w-full">
            {Array.from(new Set(articles.map(article => article.category))).map((category, index) => (
              <span key={index} className="flex-grow px-6 py-3 bg-white rounded-full shadow-md text-gray-700 font-semibold hover:bg-gray-100 transition duration-300 cursor-pointer text-center text-lg">
                {articles.find(article => article.category === category)?.icon} {category}
              </span>
            ))}
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FaStar className="mr-2 text-yellow-500" />
            Featured Bytes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(0, 3).map((article, index) => (
              <ArticleCard key={index} {...article} featured={true} />
            ))}
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FaClock className="mr-2 text-blue-500" />
            Latest Bytes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(3).map((article, index) => (
              <ArticleCard key={index} {...article} />
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
                <li><a href="#" className="hover:text-white transition duration-300">Home</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Categories</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Contact</a></li>
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