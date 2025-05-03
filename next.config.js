/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['cdn.invertimesa.workers.dev'],
    unoptimized: true, // Puedes mantener esto si prefieres no usar la optimización de Next.js
  },
  transpilePackages: ['@react-pdf/renderer'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'canvas': false,
      'pdfkit': false
    };
    return config;
  }
}

module.exports = nextConfig