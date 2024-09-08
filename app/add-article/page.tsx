import React from 'react';
import Header from '../components/Header';

export default function AddArticlePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Add New Article</h1>
        {/* Add your article submission form or component here */}
        <p>Article submission functionality will be implemented here.</p>
      </main>
    </div>
  );
}