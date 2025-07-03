/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Стандартная сборка Next.js для Netlify
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Оптимизация изображений
  images: {
    unoptimized: true
  },

  // Настройки TypeScript - временно отключены для деплоя
  typescript: {
    ignoreBuildErrors: true,
  },

  // Настройки ESLint - временно отключены для деплоя
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Experimental features
  experimental: {
    // Оптимизация bundle
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },

  // Webpack конфигурация для корректного резолва алиасов
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/hooks': path.resolve(__dirname, 'hooks'),
      '@/stores': path.resolve(__dirname, 'stores'),
      '@/services': path.resolve(__dirname, 'services'),
      '@/app': path.resolve(__dirname, 'app'),
      '@/types': path.resolve(__dirname, 'types'),
    };
    return config;
  },
};

module.exports = nextConfig; 
 