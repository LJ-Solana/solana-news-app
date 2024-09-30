import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { IDL } from '../../lib/news_content'; 

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '');
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

export async function GET() {
  const connection = new Connection(RPC_ENDPOINT);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new AnchorProvider(connection, {} as any, {});
  const program = new Program(IDL, PROGRAM_ID, provider);

  try {
    // Fetch all content accounts
    const contentAccounts = await program.account.Content.all();

    // Create a map to store user contributions and ratings
    const userStats = new Map();

    for (const account of contentAccounts) {
      const verifiedBy = account.account.verifiedBy;
      if (verifiedBy) {
        const pubkeyString = verifiedBy.toString();
        if (!userStats.has(pubkeyString)) {
          userStats.set(pubkeyString, { contributions: 0, totalRatings: 0, sumOfRatings: 0 });
        }
        const stats = userStats.get(pubkeyString);
        stats.contributions++;
        stats.totalRatings += account.account.totalRatings.toNumber();
        stats.sumOfRatings += account.account.sumOfRatings.toNumber();
      }
    }

    // Convert the map to an array and calculate average ratings
    const leaderboardData = Array.from(userStats, ([pubkey, stats]) => ({
      pubkey,
      contributions: stats.contributions,
      totalRatings: stats.totalRatings,
      averageRating: stats.totalRatings > 0 ? stats.sumOfRatings / stats.totalRatings : 0
    }));

    // Sort the leaderboard by contributions (you can change this to sort by other metrics)
    leaderboardData.sort((a, b) => b.contributions - a.contributions);

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
}
