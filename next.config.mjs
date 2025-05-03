/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // Disables ESLint checks during builds
  
  },
  typescript: {
    // Setting this to true will ignore type errors during build
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
  };
  
  export default nextConfig;
  