/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Room for admin uploads (résumé PDFs up to 4 MB, sent as base64).
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
