/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['fonts.gstatic.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
  transpilePackages: [
    '@firebase/auth',
    '@firebase/app',
    'firebase'
  ],
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false
      }
    }

    // Configuração específica para o undici
    config.module.rules.push({
      test: /[\\/]node_modules[\\/]undici[\\/].*\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            ['@babel/plugin-transform-private-methods', { loose: true }]
          ],
          sourceType: 'unambiguous'
        }
      }
    })

    return config
  }
}

module.exports = nextConfig 