import React from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-gray-300 hover:text-blue-400">
            <FaArrowLeft className="text-2xl" aria-label="Back to Home" />
          </Link>
        </div>
        <div className="bg-gray-800 p-8 rounded-lg shadow-md text-gray-200">
          <h1 className="text-3xl font-bold mb-6 text-white">Byte News Privacy Policy</h1>
          <p className="mb-4">Last updated: [Insert Date]</p>
          <p className="mb-6">
            At Byte News, we value your privacy and are committed to protecting your personal information. 
            This Privacy Policy outlines how we collect, use, and safeguard your data when you use our service.
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal Information: Name, email address, and account credentials.</li>
              <li>Usage Data: Information on how you interact with our app and services.</li>
              <li>Device Information: Type of device, operating system, and browser used.</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our service</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information 
              from unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Third-Party Services</h2>
            <p>
              We may employ third-party companies and individuals to facilitate our service, 
              provide the service on our behalf, perform service-related services, or assist us 
              in analyzing how our service is used.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Contact Us</h2>
            <p className="mb-2">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-gray-700 p-4 rounded-md">
              <h3 className="font-semibold mb-2 text-white">Contact Information</h3>
              <p>Email: privacy@bytenews.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;