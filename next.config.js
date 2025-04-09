/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  experimental: {
    esmExternals: 'loose'
  },
  swcMinify: true,
  transpilePackages: ['@firebase/auth', 'firebase', '@firebase/app', '@firebase/firestore'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
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
    config.module.rules.push({
      test: /\.(mp4|webm)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/',
          outputPath: 'static/',
          name: '[name].[hash].[ext]',
        },
      },
    });
    return config;
  }
};

module.exports = nextConfig; 