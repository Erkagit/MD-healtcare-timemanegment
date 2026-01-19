/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clinic/ui', '@clinic/types'],
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
