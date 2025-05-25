/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
    images: {
      remotePatterns: [
        {
          protocol: 'http', // Allow HTTP
          hostname: '**',   // Wildcard to allow all domains
        },
        {
          protocol: 'https', // Allow HTTPS
          hostname: '**',    // Wildcard to allow all domains
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
  