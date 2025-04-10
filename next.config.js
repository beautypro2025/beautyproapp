/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['fonts.gstatic.com'],
    unoptimized: true,
  },
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

    // Adiciona suporte para private class fields
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/undici/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-proposal-private-property-in-object']
        }
      }
    });

    return config;
  }
};

module.exports = nextConfig; 