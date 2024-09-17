import { Program, AnchorProvider } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { IDL, NewsContent } from './news_content'; 

let program: Program<NewsContent> | null = null;

export const getProgram = () => {
  if (program) return program;

  console.log('Initializing program...');
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
  console.log('Connection created');
  const provider = new AnchorProvider(connection, window.solana, {});
  console.log('Provider created');
  
  const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
  console.log('Program ID:', programId.toString());

  program = new Program<NewsContent>(IDL as NewsContent, programId, provider);
  console.log('Program initialized:', program);
  console.log('Program account structure:', program.account);

  return program;
};
