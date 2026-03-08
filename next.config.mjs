import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {
    // Prevent Next from inferring monorepo root and resolving deps from parent workspace.
    root: __dirname,
    resolveAlias: {
      tailwindcss: path.resolve(__dirname, 'node_modules/tailwindcss'),
    },
  },
  
    images: {
      dangerouslyAllowLocalIP: true,
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
          protocol: 'http',
          hostname: '127.0.0.1',
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
  