const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'media.zenfs.com',
      'img.etimg.com',
      'static.finnhub.io',
      'image.cnbcfm.com',
      'cdn.snapi.dev',
      's.yimg.com',
      'images.mktw.net',
      'cdn.benzinga.com',
      'www.benzinga.com'
    ],
  },
  experimental: {
    serverActions: true
  },
  webpack: (config, { isServer }) => {
    // Suppress the warning
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { module: /node_modules\/punycode\/punycode\.js/ },
    ];
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig)