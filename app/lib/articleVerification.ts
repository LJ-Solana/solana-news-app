import { supabase } from './supabaseClient';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { sha256 } from 'js-sha256';
import { getProgram } from './solanaClient';
import { web3 } from '@project-serum/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Buffer } from 'buffer';
import { toast } from 'react-toastify';

// USDC token mint address (devnet USDC token)
const USDC_TEST_TOKEN_MINT_ADDRESS = new PublicKey('5ruoovCtJDSuQcrUU3LQ4yMZuSAVBGCc6885Qh6P2Vz9');
const SPL_TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'); 

// Initialize ed25519 hashing
console.log('Initializing ed.etc.sha512Sync');
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Function to generate content hash
function generateContentHash(articleData: { title: string; content: string }): string {
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

// Function to get or create the escrow token account
async function getOrCreateEscrowTokenAccount(connection: Connection, wallet: WalletContextState, escrowAuthorityPDA: PublicKey) {
  const associatedTokenAddress = await getAssociatedTokenAddress(
    USDC_TEST_TOKEN_MINT_ADDRESS,
    escrowAuthorityPDA,
    true,
    SPL_TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID 
  );

  console.log('Associated Token Address:', associatedTokenAddress.toBase58());

  // Check if the account already exists
  const accountInfo = await connection.getAccountInfo(associatedTokenAddress);
  
  if (!accountInfo) {
    console.log('Creating new associated token account');
    const transaction = new Transaction();
    const createATAIx = createAssociatedTokenAccountInstruction(
      wallet.publicKey!,
      associatedTokenAddress,
      escrowAuthorityPDA,
      USDC_TEST_TOKEN_MINT_ADDRESS,
      SPL_TOKEN_PROGRAM_ID, 
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    transaction.add(createATAIx);
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey!;

    if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(transaction);
        const txId = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(txId, 'confirmed');
    } else {
        throw new Error('Wallet does not support signing transactions');
    }
  } else {
    console.log('Associated token account already exists');
  }

  return associatedTokenAddress;
}

// Function to submit and verify an article with escrow mechanism
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

    const [contentPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('content'), contentHashBuffer],
      program.programId
    );

    console.log('Content PDA:', contentPDA.toBase58());

    // Ensure isVerified and isValid are booleans
    if (typeof isVerified !== 'boolean' || typeof isValid !== 'boolean') {
      throw new Error('isVerified and isValid must be boolean values');
    }

    // Get the escrow authority PDA
    const [escrowAuthorityPDA] = PublicKey.findProgramAddressSync([Buffer.from('escrow_authority')], program.programId);

    // Get or create the escrow token account
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const escrowTokenAccount = await getOrCreateEscrowTokenAccount(connection, wallet, escrowAuthorityPDA);

    // Prepare the transaction
    const tx = new Transaction();

    // Add instruction for submitting and verifying content
    const submitAndVerifyIx = await program.methods
      .submitAndVerifyContentWithStake(Array.from(contentHashBuffer))
      .accounts({
        content: contentPDA,
        author: wallet.publicKey!,
        verifier: wallet.publicKey!,
        verifierUsdcTokenAccount: await getAssociatedTokenAddress(
          USDC_TEST_TOKEN_MINT_ADDRESS,
          wallet.publicKey!,
          false,
          SPL_TOKEN_PROGRAM_ID, 
          ASSOCIATED_TOKEN_PROGRAM_ID
        ),
        escrowTokenAccount,  
        escrowAuthority: escrowAuthorityPDA,
        feePayer: wallet.publicKey!,
        tokenProgram: SPL_TOKEN_PROGRAM_ID, 
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    console.log('Instruction:', submitAndVerifyIx);

    // Add the instruction to the transaction
    tx.add(submitAndVerifyIx);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = wallet.publicKey!;

    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support signTransaction');
    }

    console.log('Signing transaction...');
    const signedTx = await wallet.signTransaction(tx);

    console.log('Sending transaction...');
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    console.log('Transaction sent, signature:', signature);

    // Retry logic for transaction confirmation
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 5;
    while (!confirmed && attempts < maxAttempts) {
      try {
        console.log(`Attempt ${attempts + 1}: Confirming transaction...`);
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        console.log('Transaction confirmation:', confirmation);
        confirmed = true;
      } catch (error) {
        console.error('Confirmation attempt failed, retrying...', error);
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Transaction confirmation failed after multiple attempts.');
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    if (!confirmed) {
      throw new Error(`Transaction was not confirmed. Check signature ${signature} using Solana Explorer or CLI.`);
    }

    return signature;
  } catch (error) {
    console.error('Error in submitAndVerifyArticle:', error);
    throw error;
  }
}


export async function verifyArticle(
  articleSlug: string,
  walletAddress: string,
  signature: string,
  articleData: { title: string; content: string; sourceUrl: string; author: string; publishedAt: string; urlToImage: string, description: string },
  wallet: WalletContextState
): Promise<{ success: boolean; message: string; onChainSignature?: string }> {
  console.log('Starting verifyArticle function with params:', { articleSlug, walletAddress, signature, articleData });
  try {
    // Ensure wallet is connected and has a public key
    if (!wallet.publicKey) {
      throw new Error('Wallet is not connected or missing public key');
    }
    console.log('Wallet public key:', wallet.publicKey.toBase58());

    // Step 1: On-chain verification
    console.log('Starting on-chain verification');
    const contentHash = generateContentHash(articleData);
    const onChainSignature = await submitAndVerifyArticle(
      contentHash,
      true, 
      true, 
      wallet
    );
    console.log('On-chain verification completed:', onChainSignature);

    // Step 2: Database update
    console.log('Starting database update');
    const verificationData = {
      slug: articleSlug,
      verified: true,
      signature: signature,
      author: articleData.author,
      title: articleData.title,
      description: articleData.description || '',
      published_at: articleData.publishedAt,
      source: articleData.sourceUrl || '',
      url_to_image: articleData.urlToImage || null,
      on_chain_verification: onChainSignature,
      content_hash: contentHash,
      verified_by: walletAddress,
      verified_at: new Date().toISOString(),
      content: articleData.content || '',
      source_url: articleData.sourceUrl || '',
    };

    console.log('Verification data:', verificationData);

    const { data, error } = await supabase
      .from('articles')
      .upsert(verificationData, { 
        onConflict: 'slug',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error upserting article:', error);
      throw error;
    }

    console.log('Supabase response:', { data, error });

    return { success: true, message: 'Article submitted and verified on-chain and off-chain', onChainSignature };
  } catch (error: unknown) {
    console.error('Error in verifyArticle:', error);
    
    if (error instanceof Error) {
      // Handling custom program error codes for on-chain verification
      if (error.message.includes('custom program error: 0x1772') || 
          error.message.includes('Content has already been submitted')) {
        toast.error('Article already submitted', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return { success: false, message: 'Article already submitted and verified.' };
      }
      if (error.message.includes('custom program error: 0xbc4')) {
        toast.warning('Please top up USDC', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return { success: false, message: 'Insufficient USDC balance. Please top up your USDC.' };
      }
      if (error.message.includes('{"Custom":6002}')) {
        toast.info('Article already verified on-chain', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return { success: false, message: 'Article has already been verified on-chain.' };
      }
      if (error.message.includes('Error Number: 3012')) {
        toast.warning('Insufficient USDC balance', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return { success: false, message: 'Insufficient USDC balance. Please top up.' };
      }

      // Generic error handling
      toast.error(`${error.message}`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return { success: false, message: `${error.message}` };
    } else {
      // Unknown error case
      toast.error('Verification failed: Unknown error', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return { success: false, message: 'Verification failed: Unknown error' };
    }
  }
}
