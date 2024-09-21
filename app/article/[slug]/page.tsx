import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  console.log('Fetching article with slug:', params.slug);
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', params.slug)
      .single();

    console.log('Raw Supabase response:', data);

    if (error) {
      console.error('Error fetching article:', error);
      throw error;
    }

    if (!data) {
      console.log('Article not found in database');
      notFound();
    }

    // Test query to verify Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('slug')
      .limit(1);

    console.log('Test query result:', { testData, testError });

    return (
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          <article className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
            {/* Rest of your component */}
          </article>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Unexpected error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Error Loading Article</h1>
          <p>An unexpected error occurred. Please try again later.</p>
          <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </main>
      </div>
    )
  }
}
