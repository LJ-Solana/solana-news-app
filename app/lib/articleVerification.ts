import { supabase } from './supabaseClient';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export const handleVerifyArticle = async (
  id: string,
  slug: string,
  title: string,
  description: string,
  author: string,
  category: string,
  publishedAt: string,
  walletAddress: string,
  signature: string,
  sourceData: string
) => {
  try {
    // Check if the article already exists
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingArticle) {
      // Update the existing article
      const { data, error } = await supabase
        .from('articles')
        .update({
          verified: true,
          verifier: walletAddress,
          signature: signature,
          source_data: sourceData,
          // Update other fields as needed
        })
        .eq('slug', slug);

      if (error) throw error;
      
      console.log('Article updated:', data);
      return { success: true, message: 'Article verified and updated successfully' };
    } else {
      // Insert a new article if it doesn't exist
      const { data, error } = await supabase
        .from('articles')
        .insert([
          {
            id,
            slug,
            title,
            description,
            author,
            category,
            published_at: publishedAt,
            verified: true,
            verifier: walletAddress,
            signature: signature,
            source_data: sourceData,
          },
        ]);

      if (error) throw error;

      console.log('New article inserted:', data);
      return { success: true, message: 'New article verified and inserted successfully' };
    }
  } catch (error) {
    console.error('Error verifying article:', error);
    return { success: false, message: 'Failed to verify article' };
  }
};

export async function verifyArticle(
  articleSlug: string,
  walletAddress: string,
  signature: string,
  articleData: { title: string; content: string; sourceUrl: string }
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify the signature
    const message = `Verify article: ${articleSlug}\nSource: ${articleData.sourceUrl}`;
    const encodedMessage = new TextEncoder().encode(message);
    const signatureUint8Array = ed.etc.hexToBytes(signature);
    const publicKeyUint8Array = ed.etc.hexToBytes(walletAddress);

    const isSignatureValid = await ed.verify(signatureUint8Array, encodedMessage, publicKeyUint8Array);
    if (!isSignatureValid) {
      return { success: false, message: 'Invalid signature' };
    }

    // Fetch the article first to check if it exists
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', articleSlug)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching article:', fetchError);
      return { success: false, message: 'Error fetching article from database' };
    }

    if (existingArticle) {
      // Update existing article
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          verified: true,
          verified_by: walletAddress,
          verified_at: new Date().toISOString(),
        })
        .eq('slug', articleSlug);

      if (updateError) {
        console.error('Error updating article:', articleSlug, updateError);
        return { success: false, message: 'Error updating article in database' };
      }

      return { success: true, message: 'Article verified successfully' };
    } else {
      // Insert new article
      const { error: insertError } = await supabase
        .from('articles')
        .insert({
          slug: articleSlug,
          title: articleData.title,
          content: articleData.content,
          source_url: articleData.sourceUrl,
          created_at: new Date().toISOString(),
          verified: true,
          verified_by: walletAddress,
          verified_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error inserting new article:', insertError);
        return { success: false, message: 'Error creating new article in database' };
      }

      return { success: true, message: 'New article created and verified successfully' };
    }
  } catch (error) {
    console.error('Error in verifyArticle:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}