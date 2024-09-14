import { supabase } from './supabaseClient';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { sha256 } from 'js-sha256';
import { getProgram } from './solanaClient';
import { web3 } from '@project-serum/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { AnchorError } from '@project-serum/anchor';

// Initialize ed25519 hashing
console.log('Initializing ed.etc.sha512Sync');
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Function to generate content hash
function generateContentHash(articleData: { title: string; content: string; }): string {
  console.log('Generating content hash for:', articleData);
  const contentString = `${articleData.title}|${articleData.content}`;
  const hash = sha256(contentString);
  console.log('Generated content hash:', hash);
  return hash;
}

// Function to get PDA from content hash
export function getPDAFromContentHash(contentHash: string): web3.PublicKey {
  console.log('Getting PDA for content hash:', contentHash);

  const contentHashBuffer = Buffer.from(contentHash, 'hex');
  console.log('Content Hash Buffer:', contentHashBuffer.toString('hex'));

  const [pda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from('content'), contentHashBuffer],
    new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)
  );
  console.log('Generated PDA:', pda.toBase58());
  return pda;
}

async function submitAndVerifyArticle(
  contentHash: string,
  isVerified: boolean,
  isValid: boolean,
  wallet: WalletContextState
) {
  try {
    const program = getProgram();
    if (!program) {
      throw new Error('Failed to get program');
    }

    // Ensure contentHashBuffer is exactly 32 bytes
    const contentHashBuffer = Buffer.from(contentHash, 'hex'); // 32 bytes
    if (contentHashBuffer.length !== 32) {
      throw new Error(`Content hash must be 32 bytes, but is ${contentHashBuffer.length} bytes`);
    }

    console.log('Content Hash Buffer:', contentHashBuffer.toString('hex'));

    const [contentPDA, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('content'), contentHashBuffer],
      program.programId
    );

    console.log('Content PDA:', contentPDA.toBase58());

    // Ensure isVerified and isValid are booleans
    if (typeof isVerified !== 'boolean' || typeof isValid !== 'boolean') {
      throw new Error('isVerified and isValid must be boolean values');
    }

    // Prepare the transaction
    const tx = new Transaction();

    // Corrected: Pass contentHashBuffer directly
    const submitAndVerifyIx = await program.methods
      .submitAndVerifyContent(contentHashBuffer, isVerified, isValid)
      .accounts({
        content: contentPDA,
        author: wallet.publicKey!,
        verifier: wallet.publicKey!, // Adjust if the verifier is different
        feePayer: wallet.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    console.log('Instruction:', submitAndVerifyIx);

    // Add the instruction to the transaction
    tx.add(submitAndVerifyIx);
    tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
    tx.feePayer = wallet.publicKey!;

    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support signTransaction');
    }

    console.log('Signing transaction...');
    const signedTx = await wallet.signTransaction(tx);

    console.log('Simulating transaction...');
    const simulation = await program.provider.connection.simulateTransaction(signedTx);

    if (simulation.value.err) {
      console.error('Transaction simulation failed:', simulation.value.err);
      console.error('Logs:', simulation.value.logs);
      throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }

    console.log('Transaction simulation successful, sending transaction...');
    const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
    console.log('Transaction sent, signature:', signature);

    const confirmation = await program.provider.connection.confirmTransaction(signature, 'confirmed');
    console.log('Transaction confirmation:', confirmation);

    return signature;
  } catch (error) {
    console.error('Error in submitAndVerifyArticle:', error);

    if (error instanceof AnchorError) {
      if (error.error.errorCode.code === 'ContentAlreadyVerified') {
        console.error('Article has already been verified.');
        throw new Error('Article has already been verified.');
      } else {
        console.error('AnchorError:', error.error.errorMessage);
        throw error;
      }
    } else if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

export async function verifyArticle(
  articleSlug: string,
  walletAddress: string,
  signature: string,
  articleData: { title: string; content: string; sourceUrl: string },
  wallet: WalletContextState
): Promise<{ success: boolean; message: string; onChainSignature?: string }> {
  console.log('Starting verifyArticle function with params:', { articleSlug, walletAddress, signature, articleData });
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet is not connected or missing public key');
    }
    console.log('Wallet public key:', wallet.publicKey.toBase58());

    const contentHash = generateContentHash(articleData);

    // Attempt to submit and verify the article on-chain
    const onChainSignature = await submitAndVerifyArticle(
      contentHash,
      true,
      true,
      wallet
    );

    console.log('Preparing verification data for Supabase');
    const verificationData = {
      verified: true,
      verified_by: walletAddress,
      verified_at: new Date().toISOString(),
      signature: signature,
      content_hash: contentHash,
      on_chain_verification: onChainSignature,
    };
    console.log('Verification data:', verificationData);

    console.log('Checking if article exists in Supabase');
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', articleSlug)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching article:', fetchError);
      throw fetchError;
    }

    if (existingArticle) {
      console.log('Updating existing article in Supabase');
      const { error: updateError } = await supabase
        .from('articles')
        .update(verificationData)
        .eq('slug', articleSlug);

      if (updateError) {
        console.error('Error updating article:', updateError);
        throw updateError;
      }
      console.log('Article updated successfully');
    } else {
      console.log('Inserting new article in Supabase');
      const { error: insertError } = await supabase
        .from('articles')
        .insert({
          slug: articleSlug,
          title: articleData.title,
          content: articleData.content,
          source_url: articleData.sourceUrl,
          created_at: new Date().toISOString(),
          ...verificationData,
        });

      if (insertError) {
        console.error('Error inserting article:', insertError);
        throw insertError;
      }
      console.log('Article inserted successfully');
    }

    console.log('Article verification completed successfully');
    return { success: true, message: 'Article submitted and verified on-chain and off-chain', onChainSignature };
  } catch (error: unknown) {
    console.error('Error in verifyArticle:', error);
    if (error instanceof Error) {
      if (error.message.includes('{"Custom":6002}')) {
        return { success: false, message: 'Article has already been verified on-chain.' };
      }
      return { success: false, message: `Verification failed: ${error.message}` };
    } else {
      return { success: false, message: 'Verification failed: Unknown error' };
    }
  }
}
