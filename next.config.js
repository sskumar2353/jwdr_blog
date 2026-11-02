/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./data/**/*', './public/**/*'],
    },
  },
};

module.exports = nextConfig;
