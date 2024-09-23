import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@project-serum/anchor';

let programInstance: Program | null = null;

export async function initializeSolanaProgram(): Promise<Program> {
  if (programInstance) {
    return programInstance;
  }

  try {
    const response = await fetch('/api/program-info');
    if (!response.ok) {
      throw new Error('Failed to fetch program info');
    }
    const { programId, idl, rpcUrl } = await response.json();

    const connection = new Connection(rpcUrl, 'confirmed');
    const wallet = window.solana; // Assuming you're using Phantom or a similar wallet

    if (!wallet) {
      throw new Error('Wallet not found. Please install a Solana wallet extension.');
    }

    const provider = new AnchorProvider(
      connection, 
      wallet, 
      { preflightCommitment: 'confirmed' }
    );

    programInstance = new Program(idl as Idl, new PublicKey(programId), provider);
    return programInstance;
  } catch (error) {
    console.error('Failed to initialize Solana program:', error);
    throw error;
  }
}

export function getSolanaProgram(): Program {
  if (!programInstance) {
    throw new Error('Solana program not initialized. Call initializeSolanaProgram first.');
  }
  return programInstance;
}
