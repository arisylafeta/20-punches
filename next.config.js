const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
  experimental: {
    serverActions: true
  },
  async rewrites() {
    return [
      {
        source: '/pricing/api/webhooks',
        destination: '/api/webhooks',
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Suppress the warning
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { module: /node_modules\/jose\/dist\/node\/cjs\/runtime\/fetch\.js/ },
    ]
    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)