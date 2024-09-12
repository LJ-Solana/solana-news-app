import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { IDL } from './news_content';

const connection = new Connection('https://api.devnet.solana.com');

// Your program's ID
const programId = new PublicKey('DcyZJhRUd96TAEYV7a7rWofy6kz9QAqsji4fftcox89y');

// Function to get the provider
const getProvider = () => {
  if (typeof window !== 'undefined' && 'solana' in window) {
    const provider = new AnchorProvider(
      connection, 
      window.solana, 
      AnchorProvider.defaultOptions()
    );
    return provider;
  }
  // For server-side, you might want to use a different approach or return null
  return null;
};

// Function to get the program
const getProgram = () => {
  const provider = getProvider();
  if (!provider) return null;
  const program = new Program(IDL, programId, provider);
  return program;
};

export { connection, getProvider, getProgram };
