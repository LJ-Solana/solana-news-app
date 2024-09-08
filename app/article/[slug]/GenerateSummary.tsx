'use client';

import React, { useState, useEffect } from 'react';

export function GenerateSummary({ content }: { content: string }) {
  const [summary, setSummary] = useState<string>('Generating summary...');

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch('/api/generate-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSummary(data.summary);
      } catch (error) {
        console.error('Error generating summary:', error);
        setSummary('An error occurred while generating the summary.');
      }
    }

    fetchSummary();
  }, [content]);

  return <p className="text-gray-800 leading-relaxed mb-6">{summary}</p>;
}
