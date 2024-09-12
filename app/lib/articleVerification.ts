import { supabase } from './supabaseClient';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { sha256 } from '@noble/hashes/sha256';
import { getProgram } from './solanaClient';
import { web3 } from '@project-serum/anchor';
import { v5 as uuidv5 } from 'uuid';

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Function to generate content hash
function generateContentHash(articleData: { title: string; content: string; sourceUrl: string }): string {
  const contentString = `${articleData.title}|${articleData.content}|${articleData.sourceUrl}`;
  return Buffer.from(sha256(contentString)).toString('hex');
}

// Function to get PDA from slug
function getPDAFromSlug(slug: string): web3.PublicKey {
  // Generate a UUID v5 using the slug
  const UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
  const uuid = uuidv5(slug, UUID_NAMESPACE);
  
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from('content'), Buffer.from(uuid)],
    new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)
  );
  return pda;
}

export async function verifyArticle(
  articleSlug: string,
  walletAddress: string,
  signature: string,
  articleData: { title: string; content: string; sourceUrl: string }
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Verifying article:', { articleSlug, walletAddress, signature });

    // 1. Verify signature
    const message = `Verify article: ${articleSlug}\nSource: ${articleData.sourceUrl}`;
    const encodedMessage = new TextEncoder().encode(message);
    
    // Check if signature is base64 and convert to hex if necessary
    const signatureHex = signature.startsWith('0x') ? signature.slice(2) : 
                         Buffer.from(signature, 'base64').toString('hex');
    
    console.log('Converted signature:', signatureHex);

    // Ensure walletAddress is a valid public key
    if (!web3.PublicKey.isOnCurve(new web3.PublicKey(walletAddress))) {
      throw new Error('Invalid wallet address');
    }

    const signatureUint8Array = ed.etc.hexToBytes(signatureHex);
    const publicKeyUint8Array = new web3.PublicKey(walletAddress).toBytes();

    const isSignatureValid = await ed.verify(signatureUint8Array, encodedMessage, publicKeyUint8Array);
    if (!isSignatureValid) {
      return { success: false, message: 'Invalid signature' };
    }

    // 2. Generate content hash
    const contentHash = generateContentHash(articleData);

    // 3. Submit verification to smart contract
    const program = await getProgram();
    if (!program) {
      throw new Error('Solana program not available');
    }
    try {
      const tx = await program.methods.verifyContent(true)
        .accounts({
          content: getPDAFromSlug(articleSlug),
          verifier: new web3.PublicKey(walletAddress),
        })
        .rpc();
      console.log('On-chain verification successful. Transaction signature:', tx);
    } catch (onChainError: unknown) {
      console.error('On-chain verification failed:', onChainError);
      if (onChainError instanceof Error) {
        throw new Error(`On-chain verification failed: ${onChainError.message}`);
      } else {
        throw new Error('On-chain verification failed: Unknown error');
      }
    }

    // 4. Update or insert article in Supabase
    const verificationData = {
      verified: true,
      verified_by: walletAddress,
      verified_at: new Date().toISOString(),
      signature: signature,
      content_hash: contentHash,
      on_chain_verification: getPDAFromSlug(articleSlug).toString(),
    };

    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', articleSlug)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingArticle) {
      // Update existing article
      const { error: updateError } = await supabase
        .from('articles')
        .update(verificationData)
        .eq('slug', articleSlug);

      if (updateError) throw updateError;
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
          ...verificationData
        });

      if (insertError) throw insertError;
    }

    return { success: true, message: 'Article verified on-chain and off-chain' };
  } catch (error: unknown) {
    console.error('Error in verifyArticle:', error);
    if (error instanceof Error) {
      return { success: false, message: `Verification failed: ${error.message}` };
    } else {
      return { success: false, message: 'Verification failed: Unknown error' };
    }
  }
}