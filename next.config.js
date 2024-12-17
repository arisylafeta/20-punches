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
  webpack: (config, { isServer }) => {
    // Suppress the warning
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { module: /node_modules\/yaml\/browser\/dist\/index\.js/ },
      { module: /node_modules\/next\/dist\/compiled\/webpack\/bundle5\.js/ },
    ]
    return config
  }
}

module.exports = withBundleAnalyzer(nextConfig)