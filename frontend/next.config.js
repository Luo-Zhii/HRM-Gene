/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode for development
  reactStrictMode: true,

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Image optimization
  images: {
    remotePatterns: [
      // Add any external image domains here
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },

  // Headers for security and CORS
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "development" ? "*" : "https://luo.vn",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL:
      // process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001/api",
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/",
        permanent: false,
      },
    ];
  },

  // Rewrites: proxy /api calls to the backend API during development
  async rewrites() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

  // TypeScript configuration
  typescript: {
    // Strict type checking
    tsconfigPath: "./tsconfig.json",
  },

  // ESLint configuration
  eslint: {
    // Only run ESLint on the following directories in production builds
    dirs: ["src", "app"],
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Custom webpack config if needed
    return config;
  },

  // Experimental features (optional)
  // experimental: { appDir: true }, // removed - appDir is default in Next 14 and this key is unrecognized

  // Production source maps (optional - disable for smaller bundle)
  productionBrowserSourceMaps: process.env.NODE_ENV === "development",
};

module.exports = nextConfig;
