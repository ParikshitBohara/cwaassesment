/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don’t block builds because of ESLint issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don’t block builds because of TS errors in prod build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
