import { supabase } from './supabaseClient';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { sha256 } from '@noble/hashes/sha256';
import { getProgram } from './solanaClient';
import { web3 } from '@project-serum/anchor';
import { v5 as uuidv5 } from 'uuid';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, SendTransactionError } from '@solana/web3.js';

console.log('Initializing ed.etc.sha512Sync');
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Function to generate content hash
function generateContentHash(articleData: { title: string; content: string; sourceUrl: string }): string {
  console.log('Generating content hash for:', articleData);
  const contentString = `${articleData.title}|${articleData.content}|${articleData.sourceUrl}`;
  const hash = Buffer.from(sha256(contentString)).toString('hex');
  console.log('Generated content hash:', hash);
  return hash;
}

// Function to get PDA from slug
function getPDAFromSlug(slug: string): web3.PublicKey {
  console.log('Getting PDA for slug:', slug);
  // Generate a UUID v5 using the slug
  const UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
  const uuid = uuidv5(slug, UUID_NAMESPACE);
  console.log('Generated UUID:', uuid);
  
  // Convert UUID to a Buffer and take the first 16 bytes
  const uuidBuffer = Buffer.from(uuid.replace(/-/g, ''), 'hex').slice(0, 16);
  console.log('UUID Buffer:', uuidBuffer.toString('hex'));
  
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from('content'), uuidBuffer],
    new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)
  );
  console.log('Generated PDA:', pda.toBase58());
  return pda;
}

export async function verifyArticle(
  articleSlug: string,
  walletAddress: string,
  signature: string,
  articleData: { title: string; content: string; sourceUrl: string },
  wallet: WalletContextState
): Promise<{ success: boolean; message: string }> {
  console.log('Starting verifyArticle function with params:', { articleSlug, walletAddress, signature, articleData });
  try {
    console.log('Getting program');
    const program = getProgram();
    if (!program) {
      console.error('Failed to get program');
      throw new Error('Failed to get program');
    }
    console.log('Program retrieved successfully');
    
    console.log('Verifying article:', { articleSlug, walletAddress, signature });

    console.log('Generating PDA from slug');
    const pda = getPDAFromSlug(articleSlug);
    console.log('Generated PDA:', pda.toBase58());

    if (!wallet.publicKey) {
      console.error('Wallet is not connected or missing public key');
      throw new Error('Wallet is not connected or missing public key');
    }

    console.log('Wallet public key:', wallet.publicKey.toBase58());

    console.log('Creating new transaction');
    const transaction = new Transaction();

    console.log('Creating initialize content instruction');
    // 1. Instruction to initialize content
    const initializeIx = await program.methods.initializeContent(
      articleSlug,
      articleData.title,
      articleData.content,
      articleData.sourceUrl
    )
    .accounts({
      content: pda,
      author: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

    console.log('Adding initialize content instruction to transaction');
    transaction.add(initializeIx);

    console.log('Creating verify content instruction');
    // 2. Instruction to verify content
    const verifyIx = await program.methods.verifyContent(true)
    .accounts({
      content: pda,
      verifier: new web3.PublicKey(walletAddress),
    })
    .instruction();

    console.log('Adding verify content instruction to transaction');
    transaction.add(verifyIx);

    console.log('Setting fee payer');
    // Set the fee payer
    transaction.feePayer = wallet.publicKey;

    console.log('Getting latest blockhash');
    // Get the latest blockhash
    const latestBlockhash = await program.provider.connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    console.log('Latest blockhash:', latestBlockhash.blockhash);

    console.log('Signing transaction');
    // Sign the transaction
    if (!wallet.signTransaction) {
      console.error('Wallet does not support signing transactions');
      throw new Error('Wallet does not support signing transactions');
    }
    const signedTx = await wallet.signTransaction(transaction);
    console.log('Transaction signed successfully');
    
    console.log('Sending and confirming transaction');
    // Send and confirm the transaction
    try {
      const txid = await wallet.sendTransaction(signedTx, program.provider.connection);
      console.log('Transaction sent. Transaction ID:', txid);
      await program.provider.connection.confirmTransaction(txid);
      console.log('On-chain verification successful. Transaction signature:', txid);
    } catch (error) {
      if (error instanceof SendTransactionError) {
        console.error('SendTransactionError:', error.message);
        console.error('Error logs:', error.logs);
        throw new Error(`Transaction failed: ${error.message}`);
      }
      console.error('Unknown error while sending transaction:', error);
      throw error;
    }

    console.log('Preparing verification data for Supabase');
    // 4. Update or insert article in Supabase
    const verificationData = {
      verified: true,
      verified_by: walletAddress,
      verified_at: new Date().toISOString(),
      signature: signature,
      content_hash: generateContentHash(articleData),
      on_chain_verification: pda.toString(),
    };
    console.log('Verification data:', verificationData);

    console.log('Checking if article exists in Supabase');
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', articleSlug)
      .single();

    if (fetchError) {
      console.error('Error fetching article:', fetchError);
      if (fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
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
          ...verificationData
        });

      if (insertError) {
        console.error('Error inserting article:', insertError);
        throw insertError;
      }
      console.log('Article inserted successfully');
    }

    console.log('Article verification completed successfully');
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