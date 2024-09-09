import { supabase } from './supabaseClient';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { v4 as uuidv4 } from 'uuid';

// Set up the required cryptographic function
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export async function handleVerifyArticle(
  id: string,
  slug: string,
  title: string,
  description: string,
  author: string,
  category: string,
  publishedAt: string,
  verifierPubkey: string,
  signature: string,
  sourceData: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if the article exists
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching article:', fetchError);
      return { success: false, message: 'Error fetching article' };
    }

    let result;

    if (!existingArticle) {
      // Article doesn't exist, so we'll add it
      result = await supabase
        .from('articles')
        .insert({
          id,
          slug,
          title,
          description,
          author,
          category,
          publishedAt,
          verified: true,
          verifier: verifierPubkey,
          signature,
          source_data: sourceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } else {
      // Article exists, so we'll update it
      result = await supabase
        .from('articles')
        .update({
          verified: true,
          verifier: verifierPubkey,
          signature,
          source_data: sourceData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    }

    if (result.error) throw result.error;

    return { success: true, message: existingArticle ? 'Article verified successfully' : 'Article added and verified successfully' };
  } catch (error) {
    console.error('Error in handleVerifyArticle:', error);
    return { success: false, message: 'An error occurred during verification' };
  }
}

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

    let articleId: string;

    if (!existingArticle) {
      // Article doesn't exist, so create it
      const { data: newArticle, error: insertError } = await supabase
        .from('articles')
        .insert({
          id: uuidv4(),
          slug: articleSlug,
          title: articleData.title,
          content: articleData.content,
          source_url: articleData.sourceUrl,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting new article:', insertError);
        return { success: false, message: 'Error creating new article in database' };
      }

      articleId = newArticle!.id;
    } else {
      articleId = existingArticle.id;
    }

    // Update the article with verification details
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        verified_by: walletAddress,
        verified_at: new Date().toISOString(),
      })
      .eq('id', articleId);

    if (updateError) {
      console.error('Error updating article:', articleId, updateError);
      return { success: false, message: 'Error updating article in database' };
    }

    return { success: true, message: 'Article verified successfully' };
  } catch (error) {
    console.error('Error in verifyArticle:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}