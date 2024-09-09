/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
    env: {
      NEWS_API_KEY: process.env.NEXT_PUBLIC_NEWS_API_KEY,
    },
  };
  
  export default nextConfig;