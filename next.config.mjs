/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
    images: {
      domains: [
        'alamalelectron.oro-system.com',
        'oro-system.com',
        'images.unsplash.com',
        'localhost'
      ],
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
        },
        {
          protocol: 'https',
          hostname: 'oro-system.com',
        },
        {
          protocol: 'https',
          hostname: '*.oro-system.com',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
      ],
    },
      experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },

  };
  
  export default nextConfig;
  