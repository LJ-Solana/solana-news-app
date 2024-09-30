'use client';

import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

interface WalletButtonProps {
  className?: string;
}

export default function WalletButton({ className }: WalletButtonProps) {
  return <WalletMultiButtonDynamic className={className} />;
}