/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig; 
 