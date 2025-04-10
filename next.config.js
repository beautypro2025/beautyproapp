/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      }
    ],
  },
  output: 'standalone',
  transpilePackages: [
    '@firebase/auth',
    'firebase',
    '@firebase/app',
    '@firebase/firestore',
    'undici'
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        process: false,
        buffer: false,
        util: false,
        http: false,
        https: false,
        url: false,
        zlib: false,
        xmlhttprequest: require.resolve('xmlhttprequest')
      };
    }
    return config;
  }
};

module.exports = nextConfig; 