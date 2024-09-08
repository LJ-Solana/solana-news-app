import { NextResponse } from 'next/server';

export async function GET() {
  // Your leaderboard logic here
  return NextResponse.json({ message: "Leaderboard data" });
}
