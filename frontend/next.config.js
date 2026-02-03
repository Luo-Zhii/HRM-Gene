// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // React strict mode for development
//   reactStrictMode: true,

//   // Compiler options
//   compiler: {
//     // Remove console.log in production
//     removeConsole:
//       process.env.NODE_ENV === "production"
//         ? {
//             exclude: ["error", "warn"],
//           }
//         : false,
//   },

//   // Image optimization
//   images: {
//     remotePatterns: [
//       // Add any external image domains here
//       // {
//       //   protocol: 'https',
//       //   hostname: 'example.com',
//       // },
//     ],
//   },

//   // Headers for security and CORS
//   async headers() {
//     return [
//       {
//         source: "/:path*",
//         headers: [
//           {
//             key: "X-Content-Type-Options",
//             value: "nosniff",
//           },
//           {
//             key: "X-Frame-Options",
//             value: "SAMEORIGIN",
//           },
//           {
//             key: "X-XSS-Protection",
//             value: "1; mode=block",
//           },
//           {
//             key: "Access-Control-Allow-Origin",
//             value:
//               process.env.NODE_ENV === "development" ? "*" : "https://luo.vn",
//           },
//           {
//             key: "Access-Control-Allow-Methods",
//             value: "GET,POST,PUT,DELETE,OPTIONS",
//           },
//           {
//             key: "Access-Control-Allow-Headers",
//             value: "Content-Type, Authorization",
//           },
//         ],
//       },
//     ];
//   },

//   // Environment variables
//   env: {
//     NEXT_PUBLIC_API_URL:
//       // process.env.NEXT_PUBLIC_API_URL ||
//       "http://localhost:3001/api",
//   },

//   // Redirects
//   async redirects() {
//     return [
//       {
//         source: "/dashboard",
//         destination: "/",
//         permanent: false,
//       },
//     ];
//   },

//   // Rewrites: proxy /api calls to the backend API during development
//   async rewrites() {
//     const apiUrl =
//       process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
//     return [
//       {
//         source: "/api/:path*",
//         destination: `${apiUrl}/:path*`,
//       },
//     ];
//   },

//   // TypeScript configuration
//   typescript: {
//     // Strict type checking
//     tsconfigPath: "./tsconfig.json",
//   },

//   // ESLint configuration
//   eslint: {
//     // Only run ESLint on the following directories in production builds
//     dirs: ["src", "app"],
//   },

//   // Webpack configuration
//   webpack: (config, { isServer }) => {
//     // Custom webpack config if needed
//     return config;
//   },

//   // Experimental features (optional)
//   // experimental: { appDir: true }, // removed - appDir is default in Next 14 and this key is unrecognized

//   // Production source maps (optional - disable for smaller bundle)
//   productionBrowserSourceMaps: process.env.NODE_ENV === "development",
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 1. Cấu hình cho CLIENT (Trình duyệt của người dùng)
  // Client cần biết địa chỉ Public để gọi request
  env: {
    // Nếu bạn dùng Nginx/Cloudflare thì đổi thành domain, còn hiện tại cứ để IP Public port 3000
    NEXT_PUBLIC_API_URL: "http://47.130.182.18:3000/api",
  },

  // 2. Cấu hình cho SERVER (Next.js Proxy)
  // Server Next.js sẽ âm thầm gọi sang Backend qua đường nội bộ
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // QUAN TRỌNG: Bắt buộc dùng 127.0.0.1:3001 để đi đường nội bộ.
        // Tuyệt đối không dùng IP Public ở dòng này.
        destination: "http://127.0.0.1:3001/api/:path*",
      },
    ];
  },

  // Các phần khác giữ nguyên
  async redirects() {
    return [{ source: "/dashboard", destination: "/", permanent: false }];
  },
  typescript: { tsconfigPath: "./tsconfig.json" },
  eslint: { dirs: ["src", "app"] },
};

module.exports = nextConfig;