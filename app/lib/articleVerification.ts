import { supabase } from './supabaseClient';
import { PublicKey } from '@solana/web3.js';
import * as ed25519 from '@noble/ed25519';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

// Set up the required cryptographic function
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export async function handleVerifyArticle(slug: string, verifierPubkey: string, signature: string, sourceData: string): Promise<{ success: boolean; message: string }> {
  try {
    // Verify the Solana signature
    const message = `Verify article: ${slug}\nSource: ${sourceData}`;
    const encodedMessage = new TextEncoder().encode(message);
    const publicKey = new PublicKey(verifierPubkey);

    const isValid = await ed25519.verify(
      Buffer.from(signature, 'base64'),
      encodedMessage,
      publicKey.toBytes()
    );

    if (!isValid) {
      console.log(`Invalid signature for article: ${slug}`);
      return { success: false, message: 'Invalid signature' };
    }

    // Check if the verifier has already verified 5 articles today
    const today = new Date().toISOString().split('T')[0];
    const { data: verifications, error: verificationError } = await supabase
      .from('articles')
      .select('*')
      .eq('verifier', verifierPubkey)
      .gte('created_at', today);

    if (verificationError) {
      console.log(`Error fetching verifications: ${verifierPubkey}`, verificationError);
      return { success: false, message: 'Error checking verification limit' };
    }

    if (verifications && verifications.length >= 100) {
      console.log(`Verifier ${verifierPubkey} has reached the daily limit`);
      return { success: false, message: 'Daily verification limit reached' };
    }
    
    // Update the article as verified, or insert if it doesn't exist
    const { error: articleError } = await supabase
      .from('articles')
      .upsert({ 
        slug,
        verified: true, 
        verifier: verifierPubkey, 
        signature,
        source_data: sourceData,
        created_at: new Date().toISOString()
      }, { 
        onConflict: 'slug'
      });

    if (articleError) {
      console.log(`Error updating article: ${slug}`, articleError);
      return { success: false, message: 'Error updating article in database' };
    }

    // Check if the verifier already exists
    const { data: existingVerifier, error: fetchError } = await supabase
      .from('verifiers')
      .select('*')
      .eq('pubkey', verifierPubkey)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.log(`Error fetching verifier: ${verifierPubkey}`, fetchError);
      // Handle the error as needed, but don't return here
    }

    if (existingVerifier) {
      // If the verifier exists, increment their verified_count
      const { error: updateError } = await supabase
        .from('verifiers')
        .update({ verified_count: existingVerifier.verified_count + 1 })
        .eq('pubkey', verifierPubkey);

      if (updateError) {
        console.log(`Error updating verifier: ${verifierPubkey}`, updateError);
        return { success: false, message: 'Error updating verifier in database' };
      }
    } else {
      // If the verifier doesn't exist, insert a new record
      const { error: insertError } = await supabase
        .from('verifiers')
        .insert({ pubkey: verifierPubkey, verified_count: 1 });

      if (insertError) {
        console.log(`Error inserting new verifier: ${verifierPubkey}`, insertError);
        return { success: false, message: 'Error inserting new verifier in database' };
      }
    }

    console.log(`Article ${slug} successfully verified by ${verifierPubkey}`);
    return { success: true, message: 'Article successfully verified' };
  } catch (error) {
    console.log('Error in handleVerifyArticle:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}