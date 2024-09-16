import { Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export async function queryContentRatings(program: Program, contentPDA: PublicKey) {
  try {
    // Fetch the content account data
    const contentAccount = await program.account.content.fetch(contentPDA);

    // Extract the total ratings and sum of ratings
    const totalRatings = contentAccount.totalRatings.toNumber();
    const sumOfRatings = contentAccount.sumOfRatings.toNumber();

    // Calculate the average rating
    const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

    return {
      totalRatings,
      sumOfRatings,
      averageRating: parseFloat(averageRating.toFixed(2))
    };
  } catch (error) {
    console.error('Error querying content ratings:', error);
    throw error;
  }
}